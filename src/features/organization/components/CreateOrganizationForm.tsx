import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { type FormEvent, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { routes } from '../../../routes';
import AdminFormPageShell from '../../dashboard/shared/components/AdminFormPageShell';
import { organizationService } from '../api/organizationService';
import type { OrganizationFormValues } from '../types/organization.types';
import {
  emptyOrganizationForm,
  formValuesToPayload,
  validateOrganizationForm,
} from '../utils/organizationForm';
import OrganizationFormFields from './OrganizationFormFields';

const FORM_ID = 'create-organization-form';

interface CreateOrganizationFormProps {
  onCreated: () => void;
}

const CreateOrganizationForm = ({ onCreated }: CreateOrganizationFormProps) => {
  const [form, setForm] = useState<OrganizationFormValues>(emptyOrganizationForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof OrganizationFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyOrganizationForm);
    setErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateOrganizationForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await organizationService.create(formValuesToPayload(form));
      resetForm();
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminFormPageShell
      title="Create Organization"
      description="Fill in the details below to register a new organization."
      breadcrumbItems={[{ label: 'Organizations', href: routes.adminOrganizations }, { label: 'Create Organization' }]}
      actions={
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          startIcon={isSubmitting ? undefined : <AddOutlinedIcon />}
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
          {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Organization'}
        </Button>
      }
    >
      <Box component="form" id={FORM_ID} onSubmit={handleSubmit}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <OrganizationFormFields
          form={form}
          errors={errors}
          isSubmitting={isSubmitting}
          onFieldChange={setField}
        />
      </Box>
    </AdminFormPageShell>
  );
};

export default CreateOrganizationForm;