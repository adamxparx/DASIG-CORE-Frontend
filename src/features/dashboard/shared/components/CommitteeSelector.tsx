import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { DashboardCommitteeOption } from '../types/dashboard.types';

interface CommitteeSelectorProps {
  committees: DashboardCommitteeOption[];
  selectedId: number | null;
  onCommitteeChange: (id: number | null) => void;
}

const CommitteeSelector = ({ committees, selectedId, onCommitteeChange }: CommitteeSelectorProps) => {
  const selectedCommittee = committees.find((c) => c.id === selectedId);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, sm: 1 } }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: { xs: 'none', sm: 'inline-block' },
        }}
      >
        View:
      </Typography>
      <Select
        value={selectedId ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onCommitteeChange(val ? Number(val) : null);
        }}
        size="small"
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <GroupsOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  All Committees
                </Typography>
                <Chip
                  label={committees.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    borderRadius: 1,
                  }}
                />
              </Stack>
            );
          }
          return (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <HubOutlinedIcon sx={{ fontSize: 18, color: '#059669' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {selectedCommittee?.name ?? 'Selected Committee'}
              </Typography>
              {selectedCommittee?.hasPendingSubmissions && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#EF4444',
                    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                  }}
                />
              )}
            </Stack>
          );
        }}
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          minWidth: { xs: 170, sm: 200 },
          '& .MuiSelect-select': {
            py: 0.5,
            pr: 3.5,
            pl: 1.25,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            borderRadius: 2.5,
          },
          bgcolor: 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(66, 110, 240, 0.08)',
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
        }}
      >
        <MenuItem value="" sx={{ py: 1, fontWeight: selectedId == null ? 700 : 500 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
            <GroupsOutlinedIcon sx={{ fontSize: 19, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 'inherit', flex: 1 }}>
              All Committees
            </Typography>
            <Chip
              label={`${committees.length} total`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: '#F1F5F9',
                color: '#475569',
              }}
            />
          </Stack>
        </MenuItem>
        {committees.map((committee) => (
          <MenuItem
            key={committee.id}
            value={committee.id}
            sx={{ py: 1, fontWeight: selectedId === committee.id ? 700 : 500 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
              <HubOutlinedIcon sx={{ fontSize: 18, color: selectedId === committee.id ? 'primary.main' : '#64748B' }} />
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flex: 1 }}>
                {committee.name}
              </Typography>
              {committee.hasPendingSubmissions && (
                <Chip
                  label={
                    committee.pendingSubmissionsCount && committee.pendingSubmissionsCount > 1
                      ? `${committee.pendingSubmissionsCount} new`
                      : 'new'
                  }
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                  }}
                />
              )}
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default CommitteeSelector;