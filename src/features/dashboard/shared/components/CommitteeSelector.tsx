import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { DashboardCommitteeOption } from '../types/dashboard.types';

interface CommitteeSelectorProps {
  committees: DashboardCommitteeOption[];
  selectedId: number | null;
  onCommitteeChange: (id: number | null) => void;
}

const CommitteeSelector = ({ committees, selectedId, onCommitteeChange }: CommitteeSelectorProps) => {
  if (committees.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        Committee
      </Typography>
      <Select
        value={selectedId ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onCommitteeChange(val ? Number(val) : null);
        }}
        size="small"
        displayEmpty
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          '& .MuiSelect-select': { py: 0.4, pr: 3, pl: 1 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' },
          },
        }}
      >
        <MenuItem value="" disabled>
          All Committees
        </MenuItem>
        {committees.map((committee) => (
          <MenuItem key={committee.id} value={committee.id}>
            {committee.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default CommitteeSelector;