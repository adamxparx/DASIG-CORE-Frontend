import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AlertDetailResponse } from '../types/alerts.types';

interface AlertCardProps {
  alert: AlertDetailResponse;
  onClick: () => void;
}

export function formatValue(value: number | undefined | null, unit: string | undefined | null): string {
  if (value === undefined || value === null) return '--';
  
  const unitStr = unit || '';
  
  if (unitStr.toLowerCase() === 'percentage' || unitStr === '%') {
    return `${value}%`;
  }
  if (unitStr.toLowerCase() === 'ms') {
    return `${value}ms`;
  }
  if (unitStr.toLowerCase() === 'hours' || unitStr.toLowerCase() === 'hour') {
    return `${value} Hours`;
  }
  if (unitStr.startsWith('/')) {
    return `${value}${unitStr}`;
  }
  
  return `${value} ${unitStr}`.trim();
}

/**
 * Returns performance status styling based on the performanceStatus field.
 */
export function getPerformanceBadgeInfo(alert: AlertDetailResponse) {
  if (alert.performanceStatus === 'RED') {
    return {
      label: 'Critical',
      bgColor: '#FCE8E6', // soft red
      textColor: '#C5221F', // dark red
      icon: <CancelRoundedIcon sx={{ color: '#C5221F' }} />,
    };
  }

  // Warning (YELLOW/GREEN or default)
  return {
    label: 'At Risk',
    bgColor: '#FEF7E0', // soft yellow/amber
    textColor: '#B06000', // dark amber
    icon: <WarningRoundedIcon sx={{ color: '#FBBC04' }} />,
  };
}

/**
 * Returns acknowledgment status styling based on the status field.
 */
export function getAcknowledgmentBadgeInfo(alert: AlertDetailResponse) {
  if (alert.status === 'ACKNOWLEDGED') {
    return {
      label: 'Acknowledged',
      bgColor: '#E8F0FE', // soft blue
      textColor: '#1A73E8', // dark blue
    };
  }

  return {
    label: 'Unacknowledged',
    bgColor: '#F1F3F4', // soft gray
    textColor: '#5F6368', // dark gray
  };
}

export default function AlertCard({ alert, onClick }: AlertCardProps) {
  const perfBadge = getPerformanceBadgeInfo(alert);
  const ackBadge = getAcknowledgmentBadgeInfo(alert);
  
  // Format date nicely e.g. "May 12, 2026"
  const formattedDate = new Date(alert.detectedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(66, 110, 240, 0.08)',
          borderColor: '#426ef0',
          '& .alert-title': {
            color: '#426ef0',
          },
        },
      }}
    >
      {/* Header section containing Icon, Info Stack, and Pill Badges */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {/* Icon Container with background matching Critical status */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: perfBadge.bgColor,
              flexShrink: 0,
              '& svg': {
                fontSize: 24,
              },
            }}
          >
            {perfBadge.icon}
          </Box>
          
          {/* Title and details stack */}
          <Stack spacing={0.5}>
            <Typography
              className="alert-title"
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.05rem',
                lineHeight: 1.25,
                transition: 'color 0.2s ease',
              }}
            >
              {alert.kpiName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {alert.organizationName} • {formattedDate}
            </Typography>
          </Stack>
        </Stack>

        {/* Dual Badges (Performance Status + Acknowledgment Status) */}
        <Stack direction="row" spacing={1} sx={{ alignSelf: 'center' }}>
          {/* Performance Badge */}
          <Box
            sx={{
              px: 1.75,
              py: 0.5,
              borderRadius: '50px',
              bgcolor: perfBadge.bgColor,
              color: perfBadge.textColor,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {perfBadge.label}
          </Box>

          {/* Acknowledgment Badge */}
          <Box
            sx={{
              px: 1.75,
              py: 0.5,
              borderRadius: '50px',
              bgcolor: ackBadge.bgColor,
              color: ackBadge.textColor,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {ackBadge.label}
          </Box>
        </Stack>
      </Box>

      {/* Metrics Row */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 3, sm: 5 },
          mt: 0.5,
          flexWrap: 'wrap',
          pl: { xs: 0, sm: 7.5 }, // align metrics row with the text above
        }}
      >
        <Box sx={{ minWidth: 110 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Contribution:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
            {formatValue(alert.periodContribution, alert.unit)}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 110 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Cumulative:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
            {formatValue(alert.cumulativeValue, alert.unit)}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 110 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Scaled Target:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
            {formatValue(alert.scaledPeriodTarget, alert.unit)}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 110 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Achievement:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
            {(alert.achievementRate ?? 0).toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
