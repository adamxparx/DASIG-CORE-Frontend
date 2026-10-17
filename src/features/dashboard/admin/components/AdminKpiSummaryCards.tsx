import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import type { DashboardKpiItem } from '../../shared/types/dashboard.types';

interface AdminKpiSummaryCardsProps {
  kpis: DashboardKpiItem[];
}

const AdminKpiSummaryCards: React.FC<AdminKpiSummaryCardsProps> = ({ kpis }) => {
  const stats = useMemo(() => {
    const total = kpis.length;

    const completed = kpis.filter((kpi) => kpi.status === 'COMPLETED').length;

    const overdue = kpis.filter((kpi) => kpi.status === 'OVERDUE').length;

    const atRisk = kpis.filter((kpi) => kpi.status === 'AT_RISK').length;

    const onTrack = kpis.filter((kpi) => kpi.status === 'ON_TRACK').length;

    return { total, completed, onTrack, atRisk, overdue };
  }, [kpis]);

  const percentOfTotal = (count: number) =>
    stats.total > 0 ? `${Math.round((count / stats.total) * 100)}% of total (${count}/${stats.total})` : '';

  const cards = [
    {
      title: 'TOTAL KPIS',
      value: stats.total,
      subtitle: stats.total === 1 ? '1 active' : `${stats.total} active`,
      accentColor: '#3F6DF6',
      iconBg: '#EFF4FE',
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 22, color: '#3F6DF6' }} />,
    },
    {
      title: 'COMPLETED KPIS',
      value: stats.completed,
      subtitle: percentOfTotal(stats.completed) || 'Target achieved',
      accentColor: '#10B981',
      iconBg: '#ECFDF5',
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22, color: '#10B981' }} />,
    },
    {
      title: 'ON TRACK KPIS',
      value: stats.onTrack,
      subtitle: percentOfTotal(stats.onTrack) || 'Keeping pace',
      accentColor: '#2563EB',
      iconBg: '#EFF6FF',
      icon: <TrendingUpOutlinedIcon sx={{ fontSize: 22, color: '#2563EB' }} />,
    },
    {
      title: 'AT RISK KPIS',
      value: stats.atRisk,
      subtitle: percentOfTotal(stats.atRisk) || 'Behind pace',
      accentColor: '#F59E0B',
      iconBg: '#FFFBEB',
      icon: <WarningAmberOutlinedIcon sx={{ fontSize: 22, color: '#F59E0B' }} />,
    },
    {
      title: 'OVERDUE KPIS',
      value: stats.overdue,
      subtitle: percentOfTotal(stats.overdue) || 'Past deadline',
      accentColor: '#EF4444',
      iconBg: '#FEF2F2',
      icon: <ErrorOutlineOutlinedIcon sx={{ fontSize: 22, color: '#EF4444' }} />,
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 'grow' }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: `1.5px solid ${card.accentColor}`,
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
