import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import type { AccountRole, CreateUserFormValues } from '../types/user.types';
import { ROLE_OPTIONS } from '../utils/userDisplay';
import { requiresOrganization } from '../utils/userForm';

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
  onFieldChange: <K extends keyof CreateUserFormValues>(field: K, value: CreateUserFormValues[K]) => void;
  onRoleChange: (role: AccountRole | '') => void;
}

const UserAccountFormFields = ({
  form,
  errors,
  isSubmitting,
  readOnly = false,
  organizationOptions,
  onFieldChange,
  onRoleChange,
}: UserAccountFormFieldsProps) => {
  const fieldsDisabled = isSubmitting || readOnly;
  const showOrganizationField = form.role !== 'DASIG_ADMIN';

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
