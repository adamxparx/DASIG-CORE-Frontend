import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminFormPageShell from '../../dashboard/shared/components/AdminFormPageShell';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { CommitteeResponse } from '../../committee/types/committee.types';
import { committeeService } from '../../committee/api/committeeService';
import type { UpdateCommitteeRequest } from '../../committee/types/committee.types';
import { userService } from '../api/userService';
import type { AccountRole, CreateUserFormValues } from '../types/user.types';
import {
  formValuesToUserPayload,
  userToFormValues,
  validateUserForm,
} from '../utils/userForm';
import { isActiveAccount } from '../utils/userDisplay';
import DeactivateUserDialog from './DeactivateUserDialog';
import ActivateUserDialog from './ActivateUserDialog';
import UserAccountFormFields from './UserAccountFormFields';
import type { UserListItem } from './UsersList';

const FORM_ID = 'edit-user-account-form';

interface EditUserAccountFormProps {
  user: UserListItem;
  organizations: OrganizationResponse[];
  committees: CommitteeResponse[];
  isSelf?: boolean;
  onUpdated: () => void;
  onDeactivated: () => void;
  onActivated: () => void;
}

function getOrganizationOptions(
  organizations: OrganizationResponse[],
  user: UserListItem,
): OrganizationResponse[] {
  const active = organizations.filter((org) => org.status.toLowerCase() === 'active');
  if (user.organizationId === null) {
    return active;
  }

  const currentOrg = organizations.find((org) => org.id === user.organizationId);
  if (!currentOrg || active.some((org) => org.id === currentOrg.id)) {
    return active;
  }

  return [currentOrg, ...active];
}

const EditUserAccountForm = ({
  user,
  organizations,
  committees,
  isSelf = false,
  onUpdated,
  onDeactivated,
  onActivated,
}: EditUserAccountFormProps) => {
  const [form, setForm] = useState<CreateUserFormValues>(() => userToFormValues(user));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  const organizationOptions = useMemo(
    () => getOrganizationOptions(organizations, user),
    [organizations, user],
  );

  const isInactive = !isActiveAccount(user.status);

  useEffect(() => {
    setForm(userToFormValues(user));
    setErrors({});
    setSubmitError(null);
  }, [user]);

  const setField = <K extends keyof CreateUserFormValues>(field: K, value: CreateUserFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: AccountRole | '') => {
    setForm((prev) => ({
      ...prev,
      role,
      organizationId: role === 'DASIG_ADMIN' ? '' : prev.organizationId,
      committeeIds: role === 'TBI_MANAGER' ? (prev.committeeIds ?? []) : [],
    }));
  };

  const handleCommitteeIdsChange = (ids: number[]) => {
    setForm((prev) => ({ ...prev, committeeIds: ids }));
  };

  const syncCommitteesAfterUpdate = async (userId: number, newCommitteeIds: number[], previousCommitteeIds: number[]) => {
    const added = newCommitteeIds.filter((id) => !previousCommitteeIds.includes(id));
    const removed = previousCommitteeIds.filter((id) => !newCommitteeIds.includes(id));

    for (const committeeId of added) {
      const committee = committees.find((c) => c.id === committeeId);
      if (committee) {
        const currentLeads = committee.committeeLeadIds ?? [];
        if (!currentLeads.includes(userId)) {
          const payload: UpdateCommitteeRequest = {
            name: committee.name,
            description: committee.description ?? undefined,
            organizationIds: committee.organizationIds,
            committeeLeadIds: [...currentLeads, userId],
          };
          try {
            await committeeService.update(committeeId, payload);
          } catch {
            // Ignore sync errors
          }
        }
      }
    }

    for (const committeeId of removed) {
      const committee = committees.find((c) => c.id === committeeId);
      if (committee) {
        const currentLeads = committee.committeeLeadIds ?? [];
        if (currentLeads.includes(userId)) {
          const payload: UpdateCommitteeRequest = {
            name: committee.name,
            description: committee.description ?? undefined,
            organizationIds: committee.organizationIds,
            committeeLeadIds: currentLeads.filter((id) => id !== userId),
          };
          try {
            await committeeService.update(committeeId, payload);
          } catch {
            // Ignore sync errors
          }
        }
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isInactive || isSelf) {
      return;
    }

    const nextErrors = validateUserForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.role) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const previousCommitteeIds = user.committeeIds ?? [];
      await userService.update(user.id, formValuesToUserPayload(form));
      if (form.role === 'TBI_MANAGER') {
        await syncCommitteesAfterUpdate(user.id, form.committeeIds, previousCommitteeIds);
      }
      onUpdated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to update user account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminFormPageShell
      title="Update User Account"
      description="Modify the account details below and save your changes."
      breadcrumbItems={[{ label: 'Users', href: routes.adminUsers }, { label: user.name }]}
      banner={
        isSelf ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: 0,
              py: 1,
              '& .MuiAlert-message': { fontWeight: 500 },
            }}
          >
            Self deactivation and account update is disabled for a user.
          </Alert>
        ) : undefined
      }
      actions={
        <>
          {isInactive ? (
            <Button
              type="button"
              variant="contained"
              onClick={() => setActivateDialogOpen(true)}
              disabled={isSubmitting || isSelf}
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
              disabled={isSubmitting || isSelf}
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
            disabled={isSubmitting || isInactive || isSelf}
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

        <UserAccountFormFields
          form={form}
          errors={errors}
          isSubmitting={isSubmitting}
          readOnly={isInactive || isSelf}
          organizationOptions={organizationOptions}
          committeeOptions={committees}
          onFieldChange={setField}
          onRoleChange={handleRoleChange}
          onCommitteeIdsChange={handleCommitteeIdsChange}
        />
      </Box>

      <DeactivateUserDialog
        open={deactivateDialogOpen}
        userId={user.id}
        onClose={() => setDeactivateDialogOpen(false)}
        onDeactivated={onDeactivated}
      />
      <ActivateUserDialog
        open={activateDialogOpen}
        userId={user.id}
        onClose={() => setActivateDialogOpen(false)}
        onActivated={onActivated}
      />
    </AdminFormPageShell>
  );
};

export default EditUserAccountForm;