import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { organizationService } from '../api/organizationService';
import type { OrganizationFormValues } from '../types/organization.types';
import {
  emptyOrganizationForm,
  formValuesToPayload,
  validateOrganizationForm,
} from '../utils/organizationForm';
import OrganizationFormFields from './OrganizationFormFields';

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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Create Organization
      </Typography>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
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
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Organization'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateOrganizationForm;
