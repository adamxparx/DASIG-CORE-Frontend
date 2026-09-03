import CloseIcon from '@mui/icons-material/Close';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { AlertDetailResponse } from '../types/alerts.types';
import { formatValue, getAcknowledgmentBadgeInfo, getPerformanceBadgeInfo } from './AlertCard';

interface AlertDetailModalProps {
  alert: AlertDetailResponse | null;
  open: boolean;
  onClose: () => void;
  onAcknowledge: (id: number) => Promise<void>;
}

export default function AlertDetailModal({ alert, open, onClose, onAcknowledge }: AlertDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcknowledgeClick = async () => {
    if (!alert) return;
    setIsSubmitting(true);
    try {
      await onAcknowledge(alert.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const perfBadge = alert ? getPerformanceBadgeInfo(alert) : null;
  const ackBadge = alert ? getAcknowledgmentBadgeInfo(alert) : null;

  // Format date e.g. "May 12, 2026"
  const formattedDate = alert
    ? new Date(alert.detectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 440 }, bgcolor: 'background.paper' } },
      }}
    >
      {alert && perfBadge && ackBadge && (
        <Stack sx={{ height: '100%' }}>
          {/* Header */}
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 2.5, pb: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: perfBadge.bgColor,
                  color: alert.performanceStatus === 'RED' ? '#C5221F' : '#FBBC04',
                  flexShrink: 0,
                }}
              >
                {alert.performanceStatus === 'RED' ? (
                  <ErrorRoundedIcon sx={{ fontSize: 32 }} />
                ) : (
                  <WarningRoundedIcon sx={{ fontSize: 30 }} />
                )}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.3rem', letterSpacing: '-0.3px' }}>
                {alert.alertType === 'OVERDUE'
                  ? 'KPI Overdue Alert'
                  : alert.alertType === 'AT_RISK'
                    ? 'KPI At-Risk Alert'
                    : 'KPI Performance Alert'}
              </Typography>
            </Stack>
            <IconButton
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="close"
              sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Stack>

          <Divider />

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            <Stack spacing={3.5}>
              {/* Highlight KPI Card */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: alert.alertType === 'OVERDUE' ? '#FEF2F2' : '#FFFDF0',
                  border: '1px solid',
                  borderColor: alert.alertType === 'OVERDUE' ? '#FECACA' : '#FDE68A',
                  borderRadius: 3.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.3 }}>
                    {alert.kpiName}
                  </Typography>
                  {alert.committeeName && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {alert.committeeName}
                    </Typography>
                  )}
                </Stack>

                {/* Reason description */}
                {alert.alertType === 'OVERDUE' && (
                  <Typography variant="body2" sx={{ color: '#B91C1C', fontWeight: 600, bgcolor: '#FEE2E2', p: 1.5, borderRadius: 2 }}>
                    The deadline for this KPI expired without meeting the overall target. Requires administrative attention or follow-up.
                  </Typography>
                )}
                {alert.alertType === 'AT_RISK' && (
                  <Typography variant="body2" sx={{ color: '#B45309', fontWeight: 600, bgcolor: '#FEF3C7', p: 1.5, borderRadius: 2 }}>
                    This KPI is within 60 days of its deadline and overall progress is significantly below target pace.
                  </Typography>
                )}

                {/* Dual Badges side-by-side */}
                <Stack direction="row" spacing={1}>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.6,
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

                  <Box
                    sx={{
                      px: 2,
                      py: 0.6,
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

              {/* Details section */}
              <Stack spacing={1.25}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Details & Progress
                </Typography>

                <Stack
                  spacing={1.75}
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    bgcolor: '#F9FAF8',
                  }}
                >
                  {alert.deadline && (
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        KPI Deadline:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: alert.alertType === 'OVERDUE' ? '#DC2626' : 'text.primary' }}>
                        {new Date(alert.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Latest Contribution:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {alert.submissionId ? formatValue(alert.periodContribution, alert.unit) : 'No submissions yet'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Cumulative to Date:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatValue(alert.cumulativeValue, alert.unit)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Target Goal:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatValue(alert.targetValue ?? alert.scaledPeriodTarget, alert.unit)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Achievement Rate:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: alert.alertType === 'OVERDUE' ? '#DC2626' : 'text.primary' }}>
                      {(alert.achievementRate ?? 0).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Date Detected
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {formattedDate}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Footer */}
          {alert.status === 'UNACKNOWLEDGED' && (
            <>
              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Button
                  onClick={handleAcknowledgeClick}
                  disabled={isSubmitting}
                  variant="contained"
                  disableElevation
                  fullWidth
                  sx={{
                    bgcolor: '#188038',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.25,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#146c2e',
                    },
                  }}
                >
                  {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Acknowledge'}
                </Button>
              </Box>
            </>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
