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
import { committeeService } from '../api/committeeService';
import type { CommitteeFormValues } from '../types/committee.types';
import {
  emptyCommitteeForm,
  formValuesToPayload,
  validateCommitteeForm,
} from '../utils/committeeForm';
import CommitteeFormFields from './CommitteeFormFields';

interface CreateCommitteeFormProps {
  organizations: OrganizationResponse[];
  onCreated: () => void;
}

const CreateCommitteeForm = ({ organizations, onCreated }: CreateCommitteeFormProps) => {
  const [form, setForm] = useState<CommitteeFormValues>(emptyCommitteeForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof CommitteeFormValues>(field: K, value: CommitteeFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyCommitteeForm);
    setErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateCommitteeForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await committeeService.create(formValuesToPayload(form));
      resetForm();
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to create committee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Create Committee
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
          organizations={organizations}
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
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Committee'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateCommitteeForm;
