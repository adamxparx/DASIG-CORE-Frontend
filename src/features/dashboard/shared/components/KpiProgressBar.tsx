import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { DashboardStatus } from '../types/dashboard.types';

interface KpiProgressBarProps {
  progressPercent: number;
  status: DashboardStatus;
}

const KpiProgressBar = ({ progressPercent, status }: KpiProgressBarProps) => {
  const color: 'success' | 'warning' | 'error' =
    status === 'ON_TRACK' ? 'success' : status === 'AT_RISK' ? 'warning' : 'error';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 500, color: '#6D727A' }}>
          Progress
        </Typography>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#2E3238' }}>
          {Math.round(progressPercent)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(progressPercent, 100)}
        color={color}
        sx={{
          height: 10,
          borderRadius: 999,
          bgcolor: '#E5E8EB',
        }}
      />
    </Box>
  );
};

export default KpiProgressBar;
