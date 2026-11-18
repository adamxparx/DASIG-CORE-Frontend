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
import { organizationService } from '../api/organizationService';
import type { OrganizationFormValues, OrganizationResponse } from '../types/organization.types';
import {
  formValuesToPayload,
  isActiveOrganization,
  organizationToFormValues,
  validateOrganizationForm,
} from '../utils/organizationForm';
import DeactivateOrganizationDialog from './DeactivateOrganizationDialog';
import ActivateOrganizationDialog from './ActivateOrganizationDialog';
import OrganizationFormFields from './OrganizationFormFields';

const FORM_ID = 'edit-organization-form';

interface EditOrganizationFormProps {
  organization: OrganizationResponse;
  onUpdated: () => void;
  onDeactivated: () => void;
  onActivated: () => void;
}

const EditOrganizationForm = ({ organization, onUpdated, onDeactivated, onActivated }: EditOrganizationFormProps) => {
  const [form, setForm] = useState<OrganizationFormValues>(() => organizationToFormValues(organization));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  const isInactive = !isActiveOrganization(organization.status);

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

    if (isInactive) {
      return;
    }

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
    <AdminFormPageShell
      title="Edit Organization"
      description="Modify the organization details below and save your changes."
      breadcrumbItems={[{ label: 'Organizations', href: routes.adminOrganizations }, { label: organization.name }]}
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

        <OrganizationFormFields
          form={form}
          errors={errors}
          isSubmitting={isSubmitting}
          readOnly={isInactive}
          onFieldChange={setField}
        />
      </Box>

      <DeactivateOrganizationDialog
        open={deactivateDialogOpen}
        organizationId={organization.id}
        onClose={() => setDeactivateDialogOpen(false)}
        onDeactivated={onDeactivated}
      />

      <ActivateOrganizationDialog
        open={activateDialogOpen}
        organizationId={organization.id}
        onClose={() => setActivateDialogOpen(false)}
        onActivated={onActivated}
      />
    </AdminFormPageShell>
  );
};

export default EditOrganizationForm;