import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { type FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminFormPageShell from '../../dashboard/shared/components/AdminFormPageShell';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { UserResponse } from '../../user/types/user.types';
import { userService } from '../../user/api/userService';
import type { UpdateUserRequest } from '../../user/types/user.types';
import { committeeService } from '../api/committeeService';
import type { CommitteeFormValues, CommitteeResponse } from '../types/committee.types';
import {
  committeeToFormValues,
  formValuesToPayload,
  isActiveCommittee,
  validateCommitteeForm,
} from '../utils/committeeForm';
import CommitteeFormFields from './CommitteeFormFields';
import DeactivateCommitteeDialog from './DeactivateCommitteeDialog';
import ActivateCommitteeDialog from './ActivateCommitteeDialog';

const FORM_ID = 'edit-committee-form';

interface EditCommitteeFormProps {
  committee: CommitteeResponse;
  organizations: OrganizationResponse[];
  users: UserResponse[];
  onUpdated: () => void;
  onDeactivated: () => void;
  onActivated: () => void;
}

const EditCommitteeForm = ({
  committee,
  organizations,
  users,
  onUpdated,
  onDeactivated,
  onActivated,
}: EditCommitteeFormProps) => {
  const [form, setForm] = useState<CommitteeFormValues>(() => committeeToFormValues(committee));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  const isInactive = !isActiveCommittee(committee.status);

  useEffect(() => {
    setForm(committeeToFormValues(committee));
    setErrors({});
    setSubmitError(null);
  }, [committee]);

  const setField = <K extends keyof CommitteeFormValues>(field: K, value: CommitteeFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const syncUsersAfterUpdate = async (
    committeeId: number,
    newLeadIds: number[],
    previousLeadIds: number[],
  ) => {
    const added = newLeadIds.filter((id) => !previousLeadIds.includes(id));
    const removed = previousLeadIds.filter((id) => !newLeadIds.includes(id));

    for (const userId of added) {
      const user = users.find((u) => u.id === userId);
      if (user && user.role === 'TBI_MANAGER') {
        const currentCommitteeIds = user.committeeIds ?? [];
        if (!currentCommitteeIds.includes(committeeId)) {
          const payload: UpdateUserRequest = {
            name: user.name,
            email: user.email,
            role: user.role as 'DASIG_ADMIN' | 'TBI_MANAGER' | 'STAFF',
            organizationId: user.organizationId ?? undefined,
            committeeIds: [...currentCommitteeIds, committeeId],
          };
          try {
            await userService.update(userId, payload);
          } catch {
            // Ignore sync errors
          }
        }
      }
    }

    for (const userId of removed) {
      const user = users.find((u) => u.id === userId);
      if (user && user.role === 'TBI_MANAGER') {
        const currentCommitteeIds = user.committeeIds ?? [];
        if (currentCommitteeIds.includes(committeeId)) {
          const payload: UpdateUserRequest = {
            name: user.name,
            email: user.email,
            role: user.role as 'DASIG_ADMIN' | 'TBI_MANAGER' | 'STAFF',
            organizationId: user.organizationId ?? undefined,
            committeeIds: currentCommitteeIds.filter((id) => id !== committeeId),
          };
          try {
            await userService.update(userId, payload);
          } catch {
            // Ignore sync errors
          }
        }
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isInactive) return;

    const nextErrors = validateCommitteeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const previousLeadIds = committee.committeeLeadIds ?? [];
      await committeeService.update(committee.id, formValuesToPayload(form));
      await syncUsersAfterUpdate(committee.id, form.committeeLeadIds, previousLeadIds);
      onUpdated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to update committee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminFormPageShell
      title="Edit Committee"
      description="Modify the committee details below and save your changes."
      breadcrumbItems={[{ label: 'Committees', href: routes.adminCommittees }, { label: committee.name }]}
      actions={
        <>
          {isInactive ? (
            <Button
              type="button"
              variant="contained"
              onClick={() => setActivateDialogOpen(true)}
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                bgcolor: 'success.main',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'success.dark', boxShadow: 'none' },
              }}
            >
              Activate
            </Button>
          ) : (
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<BlockOutlinedIcon />}
              onClick={() => setDeactivateDialogOpen(true)}
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
              }}
            >
              Deactivate
            </Button>
          )}

          <Button
            type="submit"
            form={FORM_ID}
            variant="contained"
            startIcon={isSubmitting ? undefined : <SaveOutlinedIcon />}
            disabled={isSubmitting || isInactive}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Update'}
          </Button>
        </>
      }
    >
      <Box component="form" id={FORM_ID} onSubmit={handleSubmit}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <CommitteeFormFields
          form={form}
          errors={errors}
          isSubmitting={isSubmitting}
          readOnly={isInactive}
          organizations={organizations}
          users={users}
          onFieldChange={setField}
        />
      </Box>

      <DeactivateCommitteeDialog
        open={deactivateDialogOpen}
        committeeId={committee.id}
        onClose={() => setDeactivateDialogOpen(false)}
        onDeactivated={onDeactivated}
      />

      <ActivateCommitteeDialog
        open={activateDialogOpen}
        committeeId={committee.id}
        onClose={() => setActivateDialogOpen(false)}
        onActivated={onActivated}
      />
    </AdminFormPageShell>
  );
};

export default EditCommitteeForm;