import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../../../lib/api/client';
import { dashboardService } from '../../shared/api/dashboardService';
import type { DashboardKpiItem, KpiPeriodHistoryResponse } from '../../shared/types/dashboard.types';
import AdminPageLayout from '../../shared/components/AdminPageLayout';
import DashboardHeader from '../../shared/components/DashboardHeader';
import KpiProgressChart from '../../shared/components/KpiProgressChart';
import DeleteKpiDialog from '../../admin/components/DeleteKpiDialog';
import KpiFormDialog from '../../admin/components/KpiFormDialog';
import type { KpiSubmitSuccessContext } from '../../admin/components/KpiFormDialog';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const mapPerformanceStatus = (status: string): 'ON_TRACK' | 'AT_RISK' | 'DELAYED' => {
  if (status === 'GREEN') return 'ON_TRACK';
  if (status === 'YELLOW') return 'AT_RISK';
  return 'DELAYED';
};

const formatSubmissionType = (type: 'INTERNAL' | 'FINAL') => {
  if (type === 'INTERNAL') return 'Staff (internal)';
  return 'TBI final';
};

const KpiDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const kpiId = Number(id);

  const roleMatch = location.pathname.match(/^\/dashboard\/(admin|staff|tbi_manager)/);
  const userRole = roleMatch ? roleMatch[1] : 'DASIG_ADMIN';
  const isAdmin = userRole === 'DASIG_ADMIN';

  const [kpi, setKpi] = useState<DashboardKpiItem | null>(null);
  const [history, setHistory] = useState<KpiPeriodHistoryResponse | null>(null);
  const [isLoadingKpi, setIsLoadingKpi] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const loadKpi = async () => {
      setIsLoadingKpi(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboard();
        const found = data.kpis.find((item) => item.id === kpiId);
        if (found) {
          setKpi(found);
        } else {
          setError('KPI not found.');
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Unable to load KPI details.');
      } finally {
        setIsLoadingKpi(false);
      }
    };

    if (kpiId) {
      void loadKpi();
    }
  }, [kpiId]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!kpiId) return;
      setIsLoadingHistory(true);
      try {
        const data = await dashboardService.getKpiPeriodHistory(kpiId);
        setHistory(data);
      } catch {
        setHistory(null);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    void loadHistory();
  }, [kpiId]);

  const handleEditClick = () => {
    setFormDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCreateOrUpdateSuccess = (_context: KpiSubmitSuccessContext) => {
    setFormDialogOpen(false);
    showToast('KPI updated successfully.', 'success');
    navigate('/dashboard/admin');
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    showToast('KPI deleted successfully.', 'success');
    navigate('/dashboard/admin');
  };

  if (isLoadingKpi) {
    return (
      <AdminPageLayout>
        <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      </AdminPageLayout>
    );
  }

  if (error || !kpi) {
    return (
      <AdminPageLayout>
        <Stack sx={{ p: 3 }}>
          <Alert severity="error">{error ?? 'KPI not found.'}</Alert>
        </Stack>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <Stack spacing={3}>
        <DashboardHeader title={kpi.name} subtitle={kpi.description} />

        {isAdmin && (
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={handleEditClick}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDeleteClick}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                borderColor: 'divider',
                color: 'error.main',
              }}
            >
              Delete
            </Button>
          </Stack>
        )}

        <Divider />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
          <Card elevation={0} sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Overall Target
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                {formatMetricValue(kpi.targetValue)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {kpi.unit.charAt(0).toUpperCase() + kpi.unit.slice(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Period target: {formatMetricValue(kpi.periodTargetValue ?? kpi.targetValue)} {kpi.unit}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Deadline
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.15 }}>
                {formatDate(kpi.deadline)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {kpi.status === 'ON_TRACK' ? 'On track' : kpi.status === 'AT_RISK' ? 'At risk' : 'Delayed'}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Period History
          </Typography>

          {isLoadingHistory ? (
            <Stack sx={{ py: 4, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : error || !history ? (
            <Alert severity="error">Unable to load period history.</Alert>
          ) : (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Total target: ${formatMetricValue(history.targetValue)} ${history.unit}`} size="small" />
                <Chip label={`Deadline: ${formatDate(history.deadline)}`} size="small" />
                {history.currentPeriod && (
                  <Chip label={`Current: ${history.currentPeriod}`} size="small" color="primary" variant="outlined" />
                )}
              </Stack>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Official TBI final submissions by reporting period.
              </Typography>

              <KpiProgressChart history={history} role="DASIG_ADMIN" />

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 780 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Submission</TableCell>
                      <TableCell>Submitted by</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Achievement</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.periods.map((period: KpiPeriodHistoryResponse['periods'][number]) =>
                      period.submissions.length === 0 ? (
                        <TableRow
                          key={period.reportingPeriod}
                          sx={{
                            bgcolor: period.current ? 'action.hover' : 'transparent',
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600 }}>
                                {period.reportingPeriod}
                              </Typography>
                              {period.current && (
                                <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell colSpan={5}>
                            <Box
                              sx={{
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                px: 1.5,
                                py: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                No submission recorded for this period
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        period.submissions.map((submission: KpiPeriodHistoryResponse['periods'][number]['submissions'][number], index: number) => (
                          <TableRow
                            key={`${period.reportingPeriod}-${submission.id}`}
                            sx={{
                              bgcolor: period.current ? 'action.hover' : index % 2 === 0 ? 'transparent' : 'action.hover',
                            }}
                          >
                            <TableCell>
                              {index === 0 ? (
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600 }}>
                                    {period.reportingPeriod}
                                  </Typography>
                                  {period.current && (
                                    <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
                                  )}
                                </Stack>
                              ) : (
                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                  same period
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatSubmissionType(submission.submissionType)}
                                size="small"
                                sx={{
                                  bgcolor: submission.submissionType === 'FINAL' ? 'success.light' : 'info.light',
                                  color: submission.submissionType === 'FINAL' ? 'success.dark' : 'info.dark',
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {submission.submittedByName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {submission.submittedByRole.replaceAll('_', ' ')}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatMetricValue(submission.submittedValue)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {history.unit}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatMetricValue(submission.achievementRate)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={mapPerformanceStatus(submission.performanceStatus)}
                                size="small"
                                sx={{
                                  bgcolor: submission.performanceStatus === 'GREEN' ? 'success.light' : submission.performanceStatus === 'YELLOW' ? 'warning.light' : 'error.light',
                                  color: submission.performanceStatus === 'GREEN' ? 'success.dark' : submission.performanceStatus === 'YELLOW' ? 'warning.dark' : 'error.dark',
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </Box>

              {history.periods.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No reporting periods are configured for this KPI yet.
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>

      {isAdmin && (
        <>
          <KpiFormDialog
            open={formDialogOpen}
            onClose={() => setFormDialogOpen(false)}
            onSubmitSuccess={handleCreateOrUpdateSuccess}
            kpi={kpi}
          />

          <DeleteKpiDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onSubmitSuccess={handleDeleteSuccess}
            kpiId={kpi.id}
            kpiName={kpi.name}
          />
        </>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </AdminPageLayout>
  );
};

export default KpiDetailPage;
