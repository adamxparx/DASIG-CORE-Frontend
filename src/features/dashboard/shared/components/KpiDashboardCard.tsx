import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KpiAdminActions from '../../admin/components/KpiAdminActions';
import type { DashboardKpiItem, UserRole } from '../types/dashboard.types';
import KpiProgressBar from './KpiProgressBar';
import KpiStatusBadge from './KpiStatusBadge';
import SubmitProgressLink from './SubmitProgressLink';

interface KpiDashboardCardProps {
  item: DashboardKpiItem;
  role: UserRole;
  onEdit?: (item: DashboardKpiItem) => void;
  onDelete?: (item: DashboardKpiItem) => void;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysLeftText = (date: string) => {
  const now = new Date();
  const deadline = new Date(date);
  const diffInMs = deadline.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days overdue`;
  }

  return `${diffInDays} days left`;
};

const KpiDashboardCard = ({ item, role, onEdit, onDelete }: KpiDashboardCardProps) => {
  const progressPercent = (item.submittedValue / item.targetValue) * 100;

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 4, bgcolor: '#fff' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E3238' }}>
                {item.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#7D8592' }}>
                {item.description}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper elevation={0} sx={{ flex: 1, bgcolor: '#F2F4F6', borderRadius: 2.5, p: 2.25 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <GpsFixedOutlinedIcon fontSize="small" sx={{ color: '#9AA0A6' }} />
                <Typography variant="body1" sx={{ color: '#8A909C' }}>
                  Target Value
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1, color: '#2E3238' }}>
                {item.targetValue}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8A909C' }}>
                {item.unit.charAt(0).toUpperCase() + item.unit.slice(1)}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ flex: 1, bgcolor: '#F2F4F6', borderRadius: 2.5, p: 2.25 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <CalendarMonthOutlinedIcon fontSize="small" sx={{ color: '#9AA0A6' }} />
                <Typography variant="body1" sx={{ color: '#8A909C' }}>
                  Deadline
                </Typography>
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.15, color: '#2E3238' }}
              >
                {formatDate(item.deadline)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8A909C' }}>
                {getDaysLeftText(item.deadline)}
              </Typography>
            </Paper>
          </Stack>

          <KpiProgressBar progressPercent={progressPercent} status={item.status} />

          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { xs: 'flex-start', md: 'center' }, gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
              <CorporateFareOutlinedIcon fontSize="small" sx={{ color: '#9AA0A6' }} />
              <Typography
                variant="h6"
                sx={{ fontSize: '0.85rem', color: '#6D727A', fontWeight: 500, lineHeight: 1.25 }}
              >
                {item.organization}
              </Typography>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, minWidth: 200 }}>
              {role === 'DASIG_ADMIN' ? (
                <KpiAdminActions
                  onEdit={() => onEdit?.(item)}
                  onDelete={() => onDelete?.(item)}
                />
              ) : (
                <SubmitProgressLink onClick={() => undefined} />
              )}
            </Box>

            <KpiStatusBadge status={item.status} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KpiDashboardCard;
