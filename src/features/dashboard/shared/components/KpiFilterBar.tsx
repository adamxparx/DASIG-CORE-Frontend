import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { DashboardStatus } from '../types/dashboard.types';

interface KpiFilterBarProps {
  search: string;
  status: DashboardStatus | 'ALL';
  organization: string;
  organizations: string[];
  organizationLocked: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DashboardStatus | 'ALL') => void;
  onOrganizationChange: (value: string) => void;
}

const KpiFilterBar = ({
  search,
  status,
  organization,
  organizations,
  organizationLocked,
  onSearchChange,
  onStatusChange,
  onOrganizationChange,
}: KpiFilterBarProps) => {
  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
      <TextField
        label="Search KPI"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        fullWidth
      />

      <TextField
        select
        label="Organization"
        value={organization}
        onChange={(event) => onOrganizationChange(event.target.value)}
        size="small"
        sx={{ minWidth: 220 }}
        disabled={organizationLocked}
      >
        {organizations.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as DashboardStatus | 'ALL')}
        size="small"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="ALL">All Status</MenuItem>
        <MenuItem value="ON_TRACK">On Track</MenuItem>
        <MenuItem value="AT_RISK">At Risk</MenuItem>
        <MenuItem value="DELAYED">Delayed</MenuItem>
      </TextField>
    </Stack>
  );
};

export default KpiFilterBar;
