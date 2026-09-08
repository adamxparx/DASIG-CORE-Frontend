import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import type { DashboardCommitteeOption, DashboardKpiItem } from '../types/dashboard.types';
import CommitteeDashboardCard from './CommitteeDashboardCard';

interface CommitteeCardsGridProps {
  committees: DashboardCommitteeOption[];
  kpis: DashboardKpiItem[];
  search: string;
  onSearchChange: (val: string) => void;
  onManageCommittee: (committeeId: number) => void;
}

const CommitteeCardsGrid: React.FC<CommitteeCardsGridProps> = ({
  committees,
  kpis,
  search,
  onSearchChange,
  onManageCommittee,
}) => {
  const filteredCommittees = useMemo(() => {
    let list = committees;
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.organizationName && c.organizationName.toLowerCase().includes(query))
      );
    }

    // Arrange committees with new/pending submissions to be first
    return [...list].sort((a, b) => {
      const aPending = Boolean(a.hasPendingSubmissions || (a.pendingSubmissionsCount ?? 0) > 0);
      const bPending = Boolean(b.hasPendingSubmissions || (b.pendingSubmissionsCount ?? 0) > 0);

      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;

      if (aPending && bPending) {
        const aCount = a.pendingSubmissionsCount ?? 1;
        const bCount = b.pendingSubmissionsCount ?? 1;
        if (aCount !== bCount) {
          return bCount - aCount;
        }
      }

      return a.name.localeCompare(b.name);
    });
  }, [committees, search]);

  if (committees.length === 0) {
    return (
      <Box sx={{ width: '100%', py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            maxWidth: 480,
            width: '100%',
          }}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            No Committees Assigned
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You are not currently assigned as a Committee Lead to any committee.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Header & Search Bar for Committees */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: 'primary.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <GroupsOutlinedIcon />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  All Committees
                </Typography>
                <Chip
                  label={`${committees.length} active`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: '#EFF4FE',
                    color: 'primary.main',
                    height: 22,
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Select "Manage Committee" on any card or use the toggle above to view detailed KPIs
              </Typography>
            </Box>
          </Stack>

          {/* Search Box */}
          <TextField
            placeholder="Search committees..."
            size="small"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              minWidth: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: '#F8FAFC',
                '&:hover': { bgcolor: '#FFFFFF' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange('')}>
                      <ClearOutlinedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Stack>
      </Paper>

      {/* Grid of Committee Cards */}
      {filteredCommittees.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            No Committees Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
            {search
              ? `No committees matched your search query "${search}". Try adjusting your keywords.`
              : 'There are currently no active committees assigned to your organization.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCommittees.map((committee) => (
            <Grid key={committee.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CommitteeDashboardCard
                committee={committee}
                kpis={kpis}
                onManageCommittee={onManageCommittee}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CommitteeCardsGrid;
