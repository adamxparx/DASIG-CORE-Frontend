import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { OrganizationFormValues } from '../types/organization.types';

export const organizationFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
} as const;

interface OrganizationFormFieldsProps {
  form: OrganizationFormValues;
  errors: Record<string, string>;
  isSubmitting: boolean;
  readOnly?: boolean;
  onFieldChange: (field: keyof OrganizationFormValues, value: string) => void;
}

const OrganizationFormFields = ({
  form,
  errors,
  isSubmitting,
  readOnly = false,
  onFieldChange,
}: OrganizationFormFieldsProps) => {
  const fieldsDisabled = isSubmitting || readOnly;

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Name" required />
        <TextField
          fullWidth
          placeholder="Name"
          value={form.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={organizationFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Address" required />
        <TextField
          fullWidth
          placeholder="Address"
          value={form.address}
          onChange={(e) => onFieldChange('address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={organizationFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Contact Number" />
        <TextField
          fullWidth
          placeholder="Number"
          value={form.contactNumber}
          onChange={(e) => onFieldChange('contactNumber', e.target.value)}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={organizationFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Contact Email" required />
        <TextField
          fullWidth
          type="email"
          placeholder="contact@organization.com"
          value={form.contactEmail}
          onChange={(e) => onFieldChange('contactEmail', e.target.value)}
          error={!!errors.contactEmail}
          helperText={errors.contactEmail}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={organizationFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FieldLabel label="Description" />
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter description"
          value={form.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={organizationFieldSx}
        />
      </Grid>
    </Grid>
  );
};

const FieldLabel = ({ label, required = false }: { label: string; required?: boolean }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
    {label}
    {required && (
      <Typography component="span" color="error" sx={{ ml: 0.25 }}>
        *
      </Typography>
    )}
  </Typography>
);

export default OrganizationFormFields;
