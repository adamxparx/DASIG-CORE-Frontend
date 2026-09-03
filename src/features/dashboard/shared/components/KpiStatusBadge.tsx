import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Chip from '@mui/material/Chip';
import type { DashboardStatus } from '../types/dashboard.types';

const statusLabelMap: Record<DashboardStatus, string> = {
  COMPLETED: 'Completed',
  ON_TRACK: 'In Progress',
  AT_RISK: 'At Risk',
  DELAYED: 'Overdue',
};

const statusStyleMap: Record<DashboardStatus, { bg: string; color: string }> = {
  COMPLETED: { bg: '#DDF4E8', color: '#14945F' },
  ON_TRACK: { bg: '#EFF6FF', color: '#1D4ED8' },
  AT_RISK: { bg: '#FFF1D6', color: '#B06000' },
  DELAYED: { bg: '#FFE2E2', color: '#C62828' },
};

interface KpiStatusBadgeProps {
  status: DashboardStatus;
}

const KpiStatusBadge = ({ status }: KpiStatusBadgeProps) => {
  return (
    <Chip
      size="small"
      icon={
        status === 'COMPLETED' ? (
          <CheckCircleOutlinedIcon
            sx={{ fontSize: '0.95rem !important', color: `${statusStyleMap.COMPLETED.color} !important`, ml: '6px !important' }}
          />
        ) : undefined
      }
      label={statusLabelMap[status]}
      sx={{
        bgcolor: statusStyleMap[status].bg,
        color: statusStyleMap[status].color,
        fontWeight: 600,
        borderRadius: 999,
      }}
    />
  );
};

export default KpiStatusBadge;
