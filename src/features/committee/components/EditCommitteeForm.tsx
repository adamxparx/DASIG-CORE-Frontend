import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import type { OrganizationResponse } from '../../organization/types/organization.types';
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

interface EditCommitteeFormProps {
  committee: CommitteeResponse;
  organizations: OrganizationResponse[];
  onUpdated: () => void;
  onDeactivated: () => void;
  onCancel: () => void;
}

const EditCommitteeForm = ({
  committee,
  organizations,
  onUpdated,
  onDeactivated,
  onCancel,
}: EditCommitteeFormProps) => {
  const [form, setForm] = useState<CommitteeFormValues>(() => committeeToFormValues(committee));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const isInactive = !isActiveCommittee(committee.status);

  useEffect(() => {
    setForm(committeeToFormValues(committee));
    setErrors({});
    setSubmitError(null);
  }, [committee]);

  const setField = <K extends keyof CommitteeFormValues>(field: K, value: CommitteeFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      await committeeService.update(committee.id, formValuesToPayload(form));
      onUpdated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to update committee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          Edit Committee
        </Typography>

        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
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

      <DeactivateCommitteeDialog
        open={deactivateDialogOpen}
        committeeId={committee.id}
        onClose={() => setDeactivateDialogOpen(false)}
        onDeactivated={onDeactivated}
      />
    </>
  );
};

export default EditCommitteeForm;
