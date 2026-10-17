import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { DashboardStatus } from '../types/dashboard.types';

const STATUS_DISPLAY: Record<DashboardStatus, { label: string; message: string; color: string; bg: string; icon: ReactNode }> = {
  COMPLETED: {
    label: 'Completed',
    message: 'The target has been reached.',
    color: '#14945F',
    bg: '#DDF4E8',
    icon: <CheckCircleRoundedIcon />,
  },
  ON_TRACK: {
    label: 'On Track',
    message: 'Progress is keeping pace with the time passed since the KPI was created.',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    icon: <TrendingUpRoundedIcon />,
  },
  AT_RISK: {
    label: 'At Risk',
    message: 'Progress is below half of what was expected by now. The committee needs to catch up before the deadline.',
    color: '#B06000',
    bg: '#FFF1D6',
    icon: <WarningRoundedIcon />,
  },
  OVERDUE: {
    label: 'Overdue',
    message: 'The deadline passed before the target was reached.',
    color: '#C62828',
    bg: '#FFE2E2',
    icon: <ErrorRoundedIcon />,
  },
};

interface KpiStatusBannerProps {
  status: DashboardStatus;
  submittedValue: number;
  targetValue: number;
  unit: string;
}

/** Highlights the KPI's current status (same rule as KPI alerts) with its overall progress. */
const KpiStatusBanner = ({ status, submittedValue, targetValue, unit }: KpiStatusBannerProps) => {
  const display = STATUS_DISPLAY[status];
  const percent = targetValue > 0 ? Math.round((submittedValue / targetValue) * 100) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderLeft: `6px solid ${display.color}`,
        borderRadius: 2.5,
        bgcolor: display.bg,
        p: 2.5,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Box sx={{ color: display.color, display: 'flex', '& svg': { fontSize: 36 } }}>{display.icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.4 }}>
            Current status
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: display.color, lineHeight: 1.2 }}>
            {display.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
            {display.message}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {percent}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {submittedValue.toLocaleString()} of {targetValue.toLocaleString()} {unit}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default KpiStatusBanner;
