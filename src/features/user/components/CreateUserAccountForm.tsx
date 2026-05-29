import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { userService } from '../api/userService';
import type { AccountRole, CreateUserFormValues, UserResponse } from '../types/user.types';
import {
  emptyUserForm,
  formValuesToUserPayload,
  validateUserForm,
} from '../utils/userForm';
import UserAccountCreatedDialog from './UserAccountCreatedDialog';
import UserAccountFormFields from './UserAccountFormFields';

interface CreateUserAccountFormProps {
  organizations: OrganizationResponse[];
  onCreated: () => void;
}

const CreateUserAccountForm = ({ organizations, onCreated }: CreateUserAccountFormProps) => {
  const [form, setForm] = useState<CreateUserFormValues>(emptyUserForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserResponse | null>(null);

  const activeOrganizations = organizations.filter(
    (org) => org.status.toLowerCase() === 'active',
  );

  const setField = <K extends keyof CreateUserFormValues>(field: K, value: CreateUserFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyUserForm);
    setErrors({});
    setSubmitError(null);
  };

  const handleRoleChange = (role: AccountRole | '') => {
    setForm((prev) => ({
      ...prev,
      role,
      organizationId: role === 'DASIG_ADMIN' ? '' : prev.organizationId,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateUserForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.role) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await userService.create(formValuesToUserPayload(form));
      resetForm();
      onCreated();
      setCreatedUser(created);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to create user account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Create User Account
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
          organizationOptions={activeOrganizations}
          onFieldChange={setField}
          onRoleChange={handleRoleChange}
        />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={resetForm}
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
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </Stack>
      </Paper>

      <UserAccountCreatedDialog
        open={createdUser !== null}
        user={createdUser}
        onClose={() => setCreatedUser(null)}
      />
    </Box>
  );
};

export default CreateUserAccountForm;
