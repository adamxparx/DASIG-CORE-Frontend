import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { CommitteeFormValues } from '../types/committee.types';
import OrganizationPickerDialog from './OrganizationPickerDialog';

export const committeeFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
} as const;

interface CommitteeFormFieldsProps {
  form: CommitteeFormValues;
  errors: Record<string, string>;
  isSubmitting: boolean;
  readOnly?: boolean;
  organizations: OrganizationResponse[];
  onFieldChange: (field: keyof CommitteeFormValues, value: CommitteeFormValues[keyof CommitteeFormValues]) => void;
}

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

const CommitteeFormFields = ({
  form,
  errors,
  isSubmitting,
  readOnly = false,
  organizations,
  onFieldChange,
}: CommitteeFormFieldsProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const fieldsDisabled = isSubmitting || readOnly;

  const handleOrgConfirm = (ids: number[]) => {
    onFieldChange('organizationIds', ids);
  };

  const removeOrg = (id: number) => {
    onFieldChange('organizationIds', form.organizationIds.filter((x) => x !== id));
  };

  return (
    <Box>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel label="Committee Name" required />
          <TextField
            fullWidth
            placeholder="Committee Name"
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={fieldsDisabled}
            hiddenLabel
            sx={committeeFieldSx}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel label="Organizations" />
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setPickerOpen(true)}
            disabled={fieldsDisabled}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            Add Organization
          </Button>

          {form.organizationIds.length > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {form.organizationIds.map((id) => {
                const org = organizations.find((o) => o.id === id);
                return (
                  <Chip
                    key={id}
                    icon={<BusinessOutlinedIcon fontSize="small" />}
                    label={org?.name ?? `Org #${id}`}
                    size="small"
                    onDelete={fieldsDisabled ? undefined : () => removeOrg(id)}
                    sx={{ borderRadius: 1.5, fontWeight: 500 }}
                  />
                );
              })}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
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
            sx={committeeFieldSx}
          />
        </Grid>
      </Grid>

      <OrganizationPickerDialog
        open={pickerOpen}
        organizations={organizations}
        selectedIds={form.organizationIds}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleOrgConfirm}
      />
    </Box>
  );
};

export default CommitteeFormFields;
