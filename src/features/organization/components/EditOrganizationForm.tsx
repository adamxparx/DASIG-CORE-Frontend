import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { organizationService } from '../api/organizationService';
import type { OrganizationFormValues, OrganizationResponse } from '../types/organization.types';
import {
  formValuesToPayload,
  organizationToFormValues,
  validateOrganizationForm,
} from '../utils/organizationForm';
import DeactivateOrganizationDialog from './DeactivateOrganizationDialog';
import OrganizationFormFields from './OrganizationFormFields';

interface EditOrganizationFormProps {
  organization: OrganizationResponse;
  onUpdated: () => void;
  onDeactivated: () => void;
  onCancel: () => void;
}

const EditOrganizationForm = ({ organization, onUpdated, onDeactivated, onCancel }: EditOrganizationFormProps) => {
  const [form, setForm] = useState<OrganizationFormValues>(() => organizationToFormValues(organization));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  useEffect(() => {
    setForm(organizationToFormValues(organization));
    setErrors({});
    setSubmitError(null);
  }, [organization]);

  const setField = (field: keyof OrganizationFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      await organizationService.update(organization.id, formValuesToPayload(form));
      onUpdated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to update organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Edit Organization
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

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mt: 3 }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={() => setDeactivateDialogOpen(true)}
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              bgcolor: 'error.main',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
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
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Update & Save'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>

    <DeactivateOrganizationDialog
      open={deactivateDialogOpen}
      organizationId={organization.id}
      onClose={() => setDeactivateDialogOpen(false)}
      onDeactivated={onDeactivated}
    />
    </>
  );
};

export default EditOrganizationForm;
