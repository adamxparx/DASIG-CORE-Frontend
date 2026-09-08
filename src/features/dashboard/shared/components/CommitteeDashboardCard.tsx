import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import type { DashboardCommitteeOption, DashboardKpiItem } from '../types/dashboard.types';
import { computeKpiStatus } from '../utils/kpiStatusUtils';

interface CommitteeDashboardCardProps {
  committee: DashboardCommitteeOption;
  kpis: DashboardKpiItem[];
  onManageCommittee: (committeeId: number) => void;
}

const CommitteeDashboardCard: React.FC<CommitteeDashboardCardProps> = ({
  committee,
  kpis,
  onManageCommittee,
}) => {
  // Filter KPIs specifically belonging to this committee
  const committeeKpis = useMemo(() => {
    return kpis.filter(
      (k) =>
        (k.committeeId != null && k.committeeId === committee.id) ||
        (k.committeeName && k.committeeName.toLowerCase() === committee.name.toLowerCase()) ||
        (k.organization && k.organization.toLowerCase() === committee.name.toLowerCase())
    );
  }, [kpis, committee.id, committee.name]);

  const stats = useMemo(() => {
    const total = committeeKpis.length;

    const completed = committeeKpis.filter((kpi) => {
      const overallTarget = kpi.overallTargetValue ?? kpi.targetValue;
      return computeKpiStatus(kpi.submittedValue, overallTarget, kpi.deadline) === 'COMPLETED';
    }).length;

    const delayed = committeeKpis.filter((kpi) => {
      const overallTarget = kpi.overallTargetValue ?? kpi.targetValue;
      return computeKpiStatus(kpi.submittedValue, overallTarget, kpi.deadline) === 'DELAYED';
    }).length;

    const atRisk = committeeKpis.filter((kpi) => {
      const overallTarget = kpi.overallTargetValue ?? kpi.targetValue;
      return computeKpiStatus(kpi.submittedValue, overallTarget, kpi.deadline) === 'AT_RISK';
    }).length;

    const onTrack = Math.max(0, total - completed - delayed - atRisk);
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      delayed,
      atRisk,
      onTrack,
    };
  }, [committeeKpis]);

  const hasNewSubmissions = Boolean(
    committee.hasPendingSubmissions || (committee.pendingSubmissionsCount ?? 0) > 0
  );
  const pendingCount = committee.pendingSubmissionsCount;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: hasNewSubmissions ? '#FECACA' : 'divider',
        borderRadius: 3.5,
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hasNewSubmissions
          ? '0 2px 10px rgba(239, 68, 68, 0.06)'
          : '0 2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: hasNewSubmissions
            ? '0 12px 28px rgba(239, 68, 68, 0.12)'
            : '0 12px 28px rgba(31, 35, 41, 0.09)',
          borderColor: hasNewSubmissions ? '#F87171' : 'primary.light',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header: Committee Title & New Submission Badge at Top Left */}
        <Box sx={{ mb: 1.5 }}>
          {hasNewSubmissions && (
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Chip
                size="small"
                icon={
                  <Box
                    component="span"
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#EF4444',
                      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                      display: 'inline-block',
                      ml: '6px !important',
                    }}
                  />
                }
                label={
                  pendingCount && pendingCount > 1
                    ? `${pendingCount} New Submissions`
                    : 'New KPI Submission'
                }
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: 1.5,
                  letterSpacing: '0.01em',
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {committee.name}
          </Typography>
        </Box>

        {/* Hero KPI Stat Count (e.g. "3 data connectors" in reference image) */}
        <Box sx={{ my: 1.5 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {stats.total} {stats.total === 1 ? 'KPI' : 'KPIs'}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Active Reporting Cycle
            </Typography>
            <Tooltip title="KPIs monitored and submitted during the active period" arrow>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer' }} />
            </Tooltip>
          </Stack>
        </Box>

        {/* Side-by-Side Dual Metric Indicators (Directly from reference layout) */}
        <Stack direction="row" spacing={2} sx={{ my: 1.5 }}>
          {/* Active / Completed KPIs */}
          <Box
            sx={{
              flex: 1,
              pl: 1.5,
              borderLeft: '4px solid #10B981',
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              Completed KPIs
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.45rem' },
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              <Box component="span" sx={{ color: '#10B981' }}>
                {stats.completed}
              </Box>
              <Box component="span" sx={{ color: 'text.disabled', fontWeight: 500, mx: 0.25 }}>
                /
              </Box>
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {stats.total}
              </Box>
            </Typography>
          </Box>

          {/* Pending / In Progress KPIs */}
          <Box
            sx={{
              flex: 1,
              pl: 1.5,
              borderLeft: '4px solid #F59E0B',
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              Pending / In Progress
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.45rem' },
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              <Box component="span" sx={{ color: '#F59E0B' }}>
                {stats.pending}
              </Box>
              <Box component="span" sx={{ color: 'text.disabled', fontWeight: 500, mx: 0.25 }}>
                /
              </Box>
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {stats.total}
              </Box>
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.75, borderColor: 'divider' }} />

        {/* Section: Status Breakdown ("TI by type (0)" in reference layout) */}
        <Box sx={{ mb: 1.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              mb: 1,
            }}
          >
            KPI Status Breakdown ({stats.total})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`${stats.completed} Completed`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 600,
                bgcolor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
              }}
            />
            <Chip
              label={`${stats.onTrack} On Track`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 600,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
              }}
            />
            {stats.atRisk > 0 && (
              <Chip
                label={`${stats.atRisk} At Risk`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: '#FFFBEB',
                  color: '#D97706',
                  border: '1px solid #FDE68A',
                }}
              />
            )}
            {stats.delayed > 0 && (
              <Chip
                label={`${stats.delayed} Delayed`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Bottom Action: "Manage Committee" Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => onManageCommittee(committee.id)}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            mt: 'auto',
            py: 1.15,
            borderRadius: 2.25,
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            bgcolor: '#1E293B', // Sleek high-contrast dark button matching Microsoft Sentinel / DASIG styling
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(30, 41, 59, 0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#0F172A',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 14px rgba(30, 41, 59, 0.25)',
            },
          }}
        >
          Manage Committee
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommitteeDashboardCard;
