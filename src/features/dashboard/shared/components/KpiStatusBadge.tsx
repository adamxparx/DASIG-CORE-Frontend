import Chip from '@mui/material/Chip';
import type { DashboardStatus } from '../types/dashboard.types';

const statusLabelMap: Record<DashboardStatus, string> = {
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  DELAYED: 'Delayed',
};

const statusStyleMap: Record<DashboardStatus, { bg: string; color: string }> = {
  ON_TRACK: { bg: '#DDF4E8', color: '#14945F' },
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
