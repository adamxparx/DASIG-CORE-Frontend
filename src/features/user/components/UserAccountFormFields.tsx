import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { AccountRole, CreateUserFormValues } from '../types/user.types';
import { ROLE_OPTIONS } from '../utils/userDisplay';
import { requiresOrganization } from '../utils/userForm';
import CommitteePickerDialog from './CommitteePickerDialog';
import type { CommitteeResponse } from '../../committee/types/committee.types';

export const userFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
} as const;

interface UserAccountFormFieldsProps {
  form: CreateUserFormValues;
  errors: Record<string, string>;
  isSubmitting: boolean;
  readOnly?: boolean;
  organizationOptions: OrganizationResponse[];
  committeeOptions: CommitteeResponse[];
  onFieldChange: <K extends keyof CreateUserFormValues>(field: K, value: CreateUserFormValues[K]) => void;
  onRoleChange: (role: AccountRole | '') => void;
  onCommitteeIdsChange: (ids: number[]) => void;
}

const UserAccountFormFields = ({
  form,
  errors,
  isSubmitting,
  readOnly = false,
  organizationOptions,
  committeeOptions,
  onFieldChange,
  onRoleChange,
  onCommitteeIdsChange,
}: UserAccountFormFieldsProps) => {
  const fieldsDisabled = isSubmitting || readOnly;
  const showOrganizationField = form.role !== 'DASIG_ADMIN';
  const showCommitteeField = form.role === 'TBI_MANAGER';
  const [pickerOpen, setPickerOpen] = useState(false);

  const organization = organizationOptions.find((o) => o.id === form.organizationId);
  const availableCommittees = showCommitteeField && organization && Array.isArray(committeeOptions)
    ? committeeOptions.filter((c) => (c.organizationIds ?? []).includes(organization.id))
    : [];

  const selectedCommittees = (form.committeeIds ?? [])
    .map((id) => committeeOptions.find((c) => c.id === id))
    .filter((c): c is CommitteeResponse => c != null);

  const handleCommitteeConfirm = (ids: number[]) => {
    onCommitteeIdsChange(ids);
  };

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
          sx={userFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        {showOrganizationField ? (
          <>
            <FieldLabel label="Assigned Organization" required={requiresOrganization(form.role)} />
            <FormControl
              fullWidth
              error={!!errors.organizationId}
              disabled={fieldsDisabled || organizationOptions.length === 0}
            >
              <Select
                value={form.organizationId}
                onChange={(e) => onFieldChange('organizationId', e.target.value as number)}
                displayEmpty
                sx={userFieldSx}
              >
                <MenuItem value="" disabled>
                  {organizationOptions.length === 0
                    ? 'No organizations available'
                    : 'Select Organization'}
                </MenuItem>
                {organizationOptions.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error={!!errors.organizationId}>
                {errors.organizationId ?? 'Select an organization to assign.'}
              </FormHelperText>
            </FormControl>
          </>
        ) : null}
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Email" required />
        <TextField
          fullWidth
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          disabled={fieldsDisabled}
          hiddenLabel
          sx={userFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FieldLabel label="Role" required />
        <FormControl fullWidth error={!!errors.role} disabled={fieldsDisabled}>
          <Select
            value={form.role}
            onChange={(e) => onRoleChange(e.target.value as AccountRole | '')}
            displayEmpty
            sx={userFieldSx}
          >
            <MenuItem value="" disabled>
              Select Role
            </MenuItem>
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error={!!errors.role}>
            {errors.role ?? 'Select a role for the user.'}
          </FormHelperText>
        </FormControl>
      </Grid>

      {showCommitteeField && (
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel label="Committees" />
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setPickerOpen(true)}
            disabled={fieldsDisabled || availableCommittees.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            Add Committee
          </Button>

          {selectedCommittees.length > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {selectedCommittees.map((committee) => (
                <Chip
                  key={committee.id}
                  label={committee.name}
                  size="small"
                  onDelete={fieldsDisabled ? undefined : () => onCommitteeIdsChange(form.committeeIds.filter((id) => id !== committee.id))}
                  sx={{ borderRadius: 1.5, fontWeight: 500 }}
                />
              ))}
            </Stack>
          )}

          <CommitteePickerDialog
            open={pickerOpen}
            committees={availableCommittees}
            selectedIds={form.committeeIds}
            onClose={() => setPickerOpen(false)}
            onConfirm={handleCommitteeConfirm}
          />
        </Grid>
      )}
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

export default UserAccountFormFields;
