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
import KpiStatusBadge from './KpiStatusBadge';
import type { DashboardStatus } from '../types/dashboard.types';

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
        paper: { sx: { width: { xs: '100%', sm: 520 }, p: 0 } },
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

        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {isLoading && (
            <Stack sx={{ py: 6, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {!isLoading && !error && history && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Target: ${history.targetValue} ${history.unit}`} size="small" />
                <Chip label={`Deadline: ${formatDate(history.deadline)}`} size="small" />
                {history.currentPeriod && (
                  <Chip label={`Current: ${history.currentPeriod}`} size="small" color="primary" variant="outlined" />
                )}
              </Stack>

              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {role === 'DASIG_ADMIN'
                  ? 'Official TBI final submissions by reporting period.'
                  : role === 'STAFF'
                    ? 'Your organization’s staff submissions by reporting period.'
                    : 'Staff internal drafts and TBI final submissions by period.'}
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    {role === 'TBI_MANAGER' && <TableCell>Type</TableCell>}
                    <TableCell align="right">Submitted</TableCell>
                    <TableCell align="right">Achievement</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.periods.map((period) =>
                    period.submissions.length === 0 ? (
                      <TableRow key={period.reportingPeriod} sx={{ opacity: period.current ? 1 : 0.85 }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: period.current ? 700 : 500 }}>
                              {period.reportingPeriod}
                            </Typography>
                            {period.current && (
                              <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
                            )}
                          </Stack>
                        </TableCell>
                        {role === 'TBI_MANAGER' && <TableCell>—</TableCell>}
                        <TableCell align="right" colSpan={role === 'TBI_MANAGER' ? 3 : 3}>
                          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            No submission
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      period.submissions.map((submission, index) => (
                        <TableRow key={`${period.reportingPeriod}-${submission.id}`}>
                          <TableCell>
                            {index === 0 ? (
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: period.current ? 700 : 500 }}>
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
                            ) : null}
                          </TableCell>
                          {role === 'TBI_MANAGER' && (
                            <TableCell>
                              <Typography variant="caption">
                                {formatSubmissionType(submission.submissionType, role)}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell align="right">{submission.submittedValue}</TableCell>
                          <TableCell align="right">{Math.round(submission.achievementRate * 10) / 10}%</TableCell>
                          <TableCell>
                            <KpiStatusBadge status={mapPerformanceStatus(submission.performanceStatus)} />
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>

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
