import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
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
import UserAccountFormFields from './UserAccountFormFields';
import type { UserListItem } from './UsersList';

interface EditUserAccountFormProps {
  user: UserListItem;
  organizations: OrganizationResponse[];
  committees: CommitteeResponse[];
  onUpdated: () => void;
  onDeactivated: () => void;
  onCancel: () => void;
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

const EditUserAccountForm = ({ user, organizations, committees, onUpdated, onDeactivated, onCancel }: EditUserAccountFormProps) => {
  const [form, setForm] = useState<CreateUserFormValues>(() => userToFormValues(user));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

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

    if (isInactive) {
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
    <>
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Update User Account
      </Typography>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <UserAccountFormFields
          form={form}
          errors={errors}
          isSubmitting={isSubmitting}
          readOnly={isInactive}
          organizationOptions={organizationOptions}
          committeeOptions={committees}
          onFieldChange={setField}
          onRoleChange={handleRoleChange}
          onCommitteeIdsChange={handleCommitteeIdsChange}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mt: 3 }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={() => setDeactivateDialogOpen(true)}
            disabled={isSubmitting || isInactive}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              bgcolor: 'error.main',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            Deactivate
          </Button>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
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
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Update & Save'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>

    <DeactivateUserDialog
      open={deactivateDialogOpen}
      userId={user.id}
      onClose={() => setDeactivateDialogOpen(false)}
      onDeactivated={onDeactivated}
    />
    </>
  );
};

export default EditUserAccountForm;
