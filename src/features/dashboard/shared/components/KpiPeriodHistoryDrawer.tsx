import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ApiError } from '../../../../lib/api/client';
import { dashboardService } from '../api/dashboardService';
import type { DashboardKpiItem, KpiPeriodHistoryResponse, UserRole } from '../types/dashboard.types';
import KpiProgressChart from './KpiProgressChart';
import KpiStatusBadge from './KpiStatusBadge';
import type { DashboardStatus } from '../types/dashboard.types';
import SubmissionReviewBadge from '../../../kpisubmission/shared/components/SubmissionReviewBadge';

interface KpiPeriodHistoryDrawerProps {
  open: boolean;
  kpi: DashboardKpiItem | null;
  role: UserRole;
  onClose: () => void;
}

const mapPerformanceStatus = (status: string): DashboardStatus => {
  if (status === 'GREEN') return 'ON_TRACK';
  if (status === 'YELLOW') return 'AT_RISK';
  return 'DELAYED';
};

const formatSubmissionType = (type: 'INTERNAL' | 'FINAL', role: UserRole) => {
  if (type === 'INTERNAL') {
    return role === 'STAFF' ? 'Staff submission' : 'Staff (internal)';
  }
  return 'TBI final';
};

const formatDate = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KpiPeriodHistoryDrawer = ({ open, kpi, role, onClose }: KpiPeriodHistoryDrawerProps) => {
  const [history, setHistory] = useState<KpiPeriodHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !kpi) {
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getKpiPeriodHistory(kpi.id);
        setHistory(response);
      } catch (err) {
        setHistory(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load period history.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [open, kpi]);

  const handleClose = () => {
    setHistory(null);
    setError(null);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 760, md: 900 }, p: 0, bgcolor: '#F8FAFC' } },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 2.5, pb: 2 }}
        >
          <Box sx={{ pr: 2 }}>
            <Typography variant="overline" sx={{ color: '#6B7280', letterSpacing: 1 }}>
              Period history
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329' }}>
              {kpi?.name ?? 'KPI'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {kpi?.organization}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} aria-label="Close period history">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          {isLoading && (
            <Stack sx={{ py: 6, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {!isLoading && !error && history && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Total target: ${formatMetricValue(history.targetValue)} ${history.unit}`} size="small" />
                <Chip label={`Deadline: ${formatDate(history.deadline)}`} size="small" />
                {history.currentPeriod && (
                  <Chip label={`Current: ${history.currentPeriod}`} size="small" color="primary" variant="outlined" />
                )}
              </Stack>

              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {role === 'DASIG_ADMIN'
                  ? 'Official TBI final submissions by reporting period.'
                  : role === 'STAFF'
                    ? 'Official approved submissions by reporting period.'
                    : 'Staff internal drafts and TBI final submissions by period.'}
              </Typography>

              <KpiProgressChart history={history} role={role} />

              <Box
                sx={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: '1px solid #E5E7EB',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                      Period submission records
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Exact submitted values used for the chart and dashboard status.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${history.periods.length} periods`}
                    size="small"
                    sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table
                    size="small"
                    sx={{
                      minWidth: 780,
                      '& th': {
                        borderBottom: '1px solid #E5E7EB',
                        bgcolor: '#F8FAFC',
                        color: '#64748B',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        py: 1.25,
                      },
                      '& td': {
                        borderBottom: '1px solid #EEF2F7',
                        py: 1.5,
                      },
                      '& tbody tr:last-child td': {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Period</TableCell>
                        <TableCell>Submission</TableCell>
                        <TableCell>Submitted by</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Achievement</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Review</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.periods.map((period) =>
                        period.submissions.length === 0 ? (
                          <TableRow
                            key={period.reportingPeriod}
                            sx={{
                              bgcolor: period.current ? '#EFF6FF' : '#FFFFFF',
                              opacity: period.current ? 1 : 0.9,
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600, color: '#111827' }}>
                                  {period.reportingPeriod}
                                </Typography>
                                {period.current && (
                                  <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell colSpan={6}>
                              <Box
                                sx={{
                                  border: '1px dashed #CBD5E1',
                                  borderRadius: 2,
                                  bgcolor: '#F8FAFC',
                                  px: 1.5,
                                  py: 1,
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                                  No submission recorded for this period
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          period.submissions.map((submission, index) => (
                            <TableRow
                              key={`${period.reportingPeriod}-${submission.id}`}
                              sx={{
                                bgcolor: period.current ? '#EFF6FF' : index % 2 === 0 ? '#FFFFFF' : '#FBFDFF',
                                '&:hover': { bgcolor: period.current ? '#DBEAFE' : '#F8FAFC' },
                              }}
                            >
                              <TableCell>
                                {index === 0 ? (
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600, color: '#111827' }}>
                                      {period.reportingPeriod}
                                    </Typography>
                                    {period.current && (
                                      <Chip
                                        label="Current"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 22 }}
                                      />
                                    )}
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                                    same period
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatSubmissionType(submission.submissionType, role)}
                                  size="small"
                                  sx={{
                                    bgcolor: submission.submissionType === 'FINAL' ? '#ECFDF5' : '#EFF6FF',
                                    color: submission.submissionType === 'FINAL' ? '#047857' : '#1D4ED8',
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                                    {submission.submittedByName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    {submission.submittedByRole.replaceAll('_', ' ')}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                                  {formatMetricValue(submission.submittedValue)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {history.unit}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                                  {formatMetricValue(submission.achievementRate)}%
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <KpiStatusBadge status={mapPerformanceStatus(submission.performanceStatus)} />
                              </TableCell>
                              <TableCell>
                                <SubmissionReviewBadge status={submission.reviewStatus} />
                              </TableCell>
                            </TableRow>
                          ))
                        )
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              {history.periods.length === 0 && (
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  No reporting periods are configured for this KPI yet.
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
};

export default KpiPeriodHistoryDrawer;