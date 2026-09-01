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
      bgColor: '#E6F4EA', // soft green
      textColor: '#188038', // dark green
    };
  }

  return {
    label: 'Unacknowledged',
    bgColor: '#F1F3F4', // soft gray
    textColor: '#5F6368', // dark gray
  };
}

const METRICS: Array<{ label: string; get: (a: AlertDetailResponse) => string }> = [
  { label: 'Contribution', get: (a) => formatValue(a.periodContribution, a.unit) },
  { label: 'Cumulative', get: (a) => formatValue(a.cumulativeValue, a.unit) },
  { label: 'Scaled Target', get: (a) => formatValue(a.scaledPeriodTarget, a.unit) },
  { label: 'Achievement', get: (a) => `${(a.achievementRate ?? 0).toFixed(1)}%` },
];

export default function AlertCard({ alert, onClick }: AlertCardProps) {
  const perfBadge = getPerformanceBadgeInfo(alert);
  const isAcknowledged = alert.status === 'ACKNOWLEDGED';

  // Format date nicely e.g. "May 12, 2026"
  const formattedDate = new Date(alert.detectedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: perfBadge.textColor,
        borderRadius: 3,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        opacity: isAcknowledged ? 0.72 : 1,
        '&:hover': {
          boxShadow: '0 6px 20px rgba(66, 110, 240, 0.1)',
          borderColor: '#426ef0',
          borderLeftColor: perfBadge.textColor,
          '& .alert-title': {
            color: '#426ef0',
          },
        },
      }}
    >
      {/* Header row: icon, title, meta, and a single severity badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2.5, pb: 2 }}>
        <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: perfBadge.bgColor,
              flexShrink: 0,
              '& svg': { fontSize: 20 },
            }}
          >
            {perfBadge.icon}
          </Box>

          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography
              className="alert-title"
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1rem',
                lineHeight: 1.25,
                transition: 'color 0.2s ease',
              }}
            >
              {alert.kpiName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
              {alert.organizationName} • {formattedDate}
              {isAcknowledged && ' • Acknowledged'}
            </Typography>
          </Stack>
        </Stack>

        {/* Single severity badge; acknowledgment is conveyed via card opacity + meta text above */}
        <Box
          sx={{
            px: 1.5,
            py: 0.4,
            borderRadius: '50px',
            bgcolor: perfBadge.bgColor,
            color: perfBadge.textColor,
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
        >
          {perfBadge.label}
        </Box>
      </Box>

      {/* Metrics row: fixed grid so values line up regardless of card width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(0,0,0,0.015)',
        }}
      >
        {METRICS.map((metric, i) => (
          <Box
            key={metric.label}
            sx={{
              px: 2.5,
              py: 1.5,
              borderLeft: i === 0 ? 'none' : '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.25, fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {metric.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
              {metric.get(alert)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
