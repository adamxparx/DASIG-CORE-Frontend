import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import type { DashboardStatus } from '../types/dashboard.types';

export interface KpiFilterBarProps {
  search: string;
  status: DashboardStatus | 'ALL';
  organization?: string;
  organizations?: string[];
  showOrganization?: boolean;
  organizationLocked?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DashboardStatus | 'ALL') => void;
  onOrganizationChange?: (value: string) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

const statusLabelMap: Record<DashboardStatus, string> = {
  COMPLETED: 'Completed',
  ON_TRACK: 'In Progress',
  AT_RISK: 'At Risk',
  DELAYED: 'Overdue',
};

const KpiFilterBar = ({
  search,
  status,
  organization = 'ALL',
  organizations = [],
  showOrganization,
  organizationLocked = false,
  onSearchChange,
  onStatusChange,
  onOrganizationChange,
  onResetFilters,
  hasActiveFilters,
}: KpiFilterBarProps) => {
  // Hide committee dropdown if explicitly requested or if organization is locked (e.g. Committee Lead or Member)
  const shouldShowOrg = showOrganization !== undefined ? showOrganization : !organizationLocked;
  const isFiltered =
    hasActiveFilters ??
    Boolean(
      search.trim() ||
      (shouldShowOrg && organization && organization !== 'ALL') ||
      status !== 'ALL'
    );
  const cleanOrgs = organizations.filter((item) => item !== 'ALL');

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <TextField
          label="Search KPI"
          placeholder="Search by title or description..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange('')}
                    edge="end"
                    aria-label="clear search"
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            flex: { md: 1 },
          }}
        />

        {shouldShowOrg && onOrganizationChange && (
          <TextField
            select
            label="Committee"
            value={organization}
            onChange={(event) => onOrganizationChange(event.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 200, md: 220 } }}
            disabled={organizationLocked}
          >
            <MenuItem value="ALL">All Committees</MenuItem>
            {cleanOrgs.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as DashboardStatus | 'ALL')}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 160, md: 170 } }}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="ON_TRACK">In Progress</MenuItem>
          <MenuItem value="AT_RISK">At Risk</MenuItem>
          <MenuItem value="DELAYED">Overdue</MenuItem>
        </TextField>

        {onResetFilters && (
          <Button
            variant="outlined"
            size="small"
            onClick={onResetFilters}
            disabled={!isFiltered}
            startIcon={<RestartAltIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              height: 40,
              px: 2,
              borderRadius: 1.5,
              borderColor: isFiltered ? 'primary.main' : 'divider',
              color: isFiltered ? 'primary.main' : 'text.disabled',
              bgcolor: isFiltered ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
              '&:hover': {
                bgcolor: isFiltered ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                borderColor: isFiltered ? 'primary.dark' : 'divider',
              },
            }}
          >
            Reset Filters
          </Button>
        )}
      </Stack>

      {isFiltered && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            pt: 0.5,
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Active filters:
            </Typography>
          </Stack>
          {search.trim() && (
            <Chip
              label={`Search: "${search.trim()}"`}
              size="small"
              onDelete={() => onSearchChange('')}
              sx={{ borderRadius: 1.5, bgcolor: '#F1F5F9', fontWeight: 500 }}
            />
          )}
          {shouldShowOrg && organization && organization !== 'ALL' && onOrganizationChange && (
            <Chip
              label={`Committee: ${organization}`}
              size="small"
              onDelete={() => onOrganizationChange('ALL')}
              sx={{ borderRadius: 1.5, bgcolor: '#F1F5F9', fontWeight: 500 }}
            />
          )}
          {status !== 'ALL' && (
            <Chip
              label={`Status: ${statusLabelMap[status] ?? status}`}
              size="small"
              onDelete={() => onStatusChange('ALL')}
              sx={{ borderRadius: 1.5, bgcolor: '#F1F5F9', fontWeight: 500 }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default KpiFilterBar;
