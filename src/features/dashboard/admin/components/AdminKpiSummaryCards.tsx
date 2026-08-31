import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import type { DashboardKpiItem } from '../../shared/types/dashboard.types';
import { getCalendarDaysUntilDeadline } from '../../../notification/utils/notificationDisplay';

interface AdminKpiSummaryCardsProps {
  kpis: DashboardKpiItem[];
}

const AdminKpiSummaryCards: React.FC<AdminKpiSummaryCardsProps> = ({ kpis }) => {
  const stats = useMemo(() => {
    const total = kpis.length;

    // Completed: submittedValue >= targetValue (target reached/exceeded)
    const completed = kpis.filter((kpi) => {
      if (kpi.targetValue > 0) {
        return kpi.submittedValue >= kpi.targetValue;
      }
      return false;
    }).length;

    // Delayed: status is DELAYED or overdue deadline and not completed
    const delayed = kpis.filter((kpi) => {
      const isCompleted = kpi.targetValue > 0 && kpi.submittedValue >= kpi.targetValue;
      if (isCompleted) return false;

      if (kpi.status === 'DELAYED') return true;

      const daysUntil = getCalendarDaysUntilDeadline(kpi.deadline);
      return daysUntil !== null && daysUntil < 0;
    }).length;

    // In progress: active KPIs that are neither completed nor delayed
    const inProgress = Math.max(0, total - completed - delayed);

    const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressPercentage = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const delayedPercentage = total > 0 ? Math.round((delayed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      delayed,
      completedPercentage,
      inProgressPercentage,
      delayedPercentage,
    };
  }, [kpis]);

  const cards = [
    {
      title: 'TOTAL KPIS',
      value: stats.total,
      subtitle: stats.total === 1 ? '1 active' : `${stats.total} active`,
      accentColor: '#3F6DF6',
      iconBg: '#EFF4FE',
      iconColor: '#3F6DF6',
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 22, color: '#3F6DF6' }} />,
    },
    {
      title: 'COMPLETED KPIS',
      value: stats.completed,
      subtitle: stats.total > 0 ? `${stats.completedPercentage}% of total (${stats.completed}/${stats.total})` : 'Target achieved',
      accentColor: '#10B981',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22, color: '#10B981' }} />,
    },
    {
      title: 'IN PROGRESS KPIS',
      value: stats.inProgress,
      subtitle: stats.total > 0 ? `${stats.inProgressPercentage}% of total (${stats.inProgress}/${stats.total})` : 'Ongoing submissions',
      accentColor: '#F59E0B',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      icon: <PendingActionsOutlinedIcon sx={{ fontSize: 22, color: '#F59E0B' }} />,
    },
    {
      title: 'DELAYED KPIS',
      value: stats.delayed,
      subtitle: stats.total > 0 ? `${stats.delayedPercentage}% of total (${stats.delayed}/${stats.total})` : 'Behind schedule',
      accentColor: '#EF4444',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      icon: <WarningAmberOutlinedIcon sx={{ fontSize: 22, color: '#EF4444' }} />,
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: `4px solid ${card.accentColor}`,
              bgcolor: '#FFFFFF',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: '0.06em',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.title}
                </Typography>

                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    bgcolor: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#111827',
                  fontSize: '1.9rem',
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                {card.value}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'block',
                }}
              >
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminKpiSummaryCards;
