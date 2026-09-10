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
import SubmissionReviewBadge from '../../../kpisubmission/shared/components/SubmissionReviewBadge';

interface KpiPeriodHistoryDrawerProps {
  open: boolean;
  kpi: DashboardKpiItem | null;
  role: UserRole;
  committeeId?: number;
  onClose: () => void;
}

const formatDate = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatRoleLabel = (role: string) => {
  if (role === 'STAFF') return 'Member';
  if (role === 'TBI_MANAGER') return 'Committee Lead';
  return role.replaceAll('_', ' ');
};

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KpiPeriodHistoryDrawer = ({ open, kpi, role, committeeId, onClose }: KpiPeriodHistoryDrawerProps) => {
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
        const response = await dashboardService.getKpiPeriodHistory(kpi.id, committeeId);
        setHistory(response);
      } catch (err) {
        setHistory(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load submission history.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [open, kpi, committeeId]);

  const handleClose = () => {
    setHistory(null);
    setError(null);
    onClose();
  };

  const submissionRows =
    history?.periods.flatMap((period) =>
      period.submissions
        .filter((submission) => submission.submissionType === 'FINAL')
        .map((submission) => ({
          ...submission,
          rowKey: `${period.reportingPeriod}-${submission.id}`,
        }))
    ) ?? [];
  const totalSubmissionCount = submissionRows.length;
  const showOrganizationColumn = role !== 'STAFF';
  const submissionTableColSpan = showOrganizationColumn ? 6 : 5;

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
              Submission history
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329' }}>
              {kpi?.name ?? 'KPI'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {kpi?.organization}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} aria-label="Close submission history">
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
                  ? 'Official final submissions with organization audit details.'
                  : role === 'STAFF'
                    ? 'Official approved submissions with their submitted dates.'
                    : 'Official final submissions with organization audit details.'}
              </Typography>

              <KpiProgressChart history={history} role={role} />

              {role === 'TBI_MANAGER' && kpi?.organizationBreakdowns && kpi.organizationBreakdowns.length > 0 && (
                <Box
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <Stack spacing={0.5} sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                      Organization Breakdown
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Official final progress contributed by each organization in this committee.
                    </Typography>
                  </Stack>
                  <Stack spacing={1.25} sx={{ p: 2 }}>
                    {kpi.organizationBreakdowns.map((breakdown) => (
                      <Stack
                        key={breakdown.organizationId}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
                      >
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                          {breakdown.organizationName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>
                            {formatMetricValue(breakdown.submittedValue)} {history.unit}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                            Achievement rate: {formatMetricValue(breakdown.achievementRate)}%
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

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
                      Official Final Records
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Exact submitted values used for dashboard history.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${totalSubmissionCount} records`}
                    size="small"
                    sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table
                    size="small"
                    sx={{
                      minWidth: 700,
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
                        <TableCell>Submission Date</TableCell>
                        {showOrganizationColumn && <TableCell>Organization</TableCell>}
                        <TableCell>Submitted by</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Achievement</TableCell>
                        <TableCell>Review</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={submissionTableColSpan}>
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
                                No submission recorded
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissionRows.map((submission, index) => (
                          <TableRow
                            key={submission.rowKey}
                            sx={{
                              bgcolor: index % 2 === 0 ? '#FFFFFF' : '#FBFDFF',
                              '&:hover': { bgcolor: '#F8FAFC' },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                {formatDate(submission.submissionDate)}
                              </Typography>
                            </TableCell>
                            {showOrganizationColumn && (
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                                  {submission.organizationName ?? '--'}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                                  {submission.submittedByName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {formatRoleLabel(submission.submittedByRole)}
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
                              <SubmissionReviewBadge status={submission.reviewStatus} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              {history.periods.length === 0 && (
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  No submission history is available for this KPI yet.
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