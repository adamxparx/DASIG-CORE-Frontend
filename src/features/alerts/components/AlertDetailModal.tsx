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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AlertDetailResponse } from '../types/alerts.types';
import { formatValue, getAcknowledgmentBadgeInfo, getPerformanceBadgeInfo } from './AlertCard';

const REMARK_MAX_LENGTH = 500;

interface AlertDetailModalProps {
  alert: AlertDetailResponse | null;
  open: boolean;
  onClose: () => void;
  /** Returns true when the alert was acknowledged, so the drawer can close. */
  onAcknowledge: (id: number, remark: string) => Promise<boolean>;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export default function AlertDetailModal({ alert, open, onClose, onAcknowledge }: AlertDetailModalProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState('');

  const handleAcknowledgeClick = async () => {
    if (!alert || remark.trim() === '') return;
    setIsSubmitting(true);
    try {
      const acknowledged = await onAcknowledge(alert.id, remark.trim());
      if (acknowledged) {
        setRemark('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewKpi = () => {
    if (!alert) return;
    navigate(`/dashboard/admin/kpis/${alert.kpiDefinitionId}`);
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
                  color: alert.performanceStatus === 'OVERDUE' ? '#C5221F' : '#FBBC04',
                  flexShrink: 0,
                }}
              >
                {alert.performanceStatus === 'OVERDUE' ? (
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
                    Progress is below half of what was expected by now, based on the time passed since the KPI was created.
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

                  {alert.expectedByNow != null && (
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Expected by Now:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {formatValue(Math.round(alert.expectedByNow * 100) / 100, alert.unit)}
                      </Typography>
                    </Stack>
                  )}

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

              {/* Admin remark (UC-4.2) */}
              {alert.adminRemark && (
                <InfoSection title="Admin Remark">
                  <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                    {alert.adminRemark}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[alert.remarkedByName, formatDate(alert.remarkedAt)].filter(Boolean).join(' • ')}
                  </Typography>
                </InfoSection>
              )}

              {/* Committee Lead explanation (Overdue only, UC-4.4) */}
              {alert.alertType === 'OVERDUE' && (
                <InfoSection title="Committee Lead Explanation">
                  {alert.explanation ? (
                    <>
                      <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                        {alert.explanation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[alert.explainedByName, formatDate(alert.explainedAt)].filter(Boolean).join(' • ')}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Awaiting explanation from the Committee Lead.
                    </Typography>
                  )}
                </InfoSection>
              )}

              {/* Automatic resolution */}
              {alert.status === 'RESOLVED' && (
                <InfoSection title="Resolved">
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {alert.resolutionReason ?? 'Resolved'}
                  </Typography>
                  {alert.resolvedAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(alert.resolvedAt)}
                    </Typography>
                  )}
                </InfoSection>
              )}

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

          {/* Footer: remark + quick action */}
          <Divider />
          <Stack spacing={1.5} sx={{ p: 2.5 }}>
            {alert.status === 'UNACKNOWLEDGED' && (
              <TextField
                label="Remark"
                placeholder="What will you do about this alert?"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                required
                multiline
                minRows={3}
                fullWidth
                disabled={isSubmitting}
                slotProps={{ htmlInput: { maxLength: REMARK_MAX_LENGTH } }}
                helperText={`Shared with the committee. ${remark.length}/${REMARK_MAX_LENGTH}`}
              />
            )}

            <Stack direction="row" spacing={1.5}>
              <Button
                onClick={handleViewKpi}
                disabled={isSubmitting}
                variant="outlined"
                fullWidth
                sx={{ fontWeight: 700, borderRadius: 2.5, py: 1.25, textTransform: 'none', fontSize: '0.9rem' }}
              >
                View KPI
              </Button>

              {alert.status === 'UNACKNOWLEDGED' && (
                <Button
                  onClick={handleAcknowledgeClick}
                  disabled={isSubmitting || remark.trim() === ''}
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
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
      <Stack spacing={0.75} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        {children}
      </Stack>
    </Stack>
  );
}
