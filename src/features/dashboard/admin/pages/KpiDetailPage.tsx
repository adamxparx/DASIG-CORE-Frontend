import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
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
import ArchiveKpiDialog from '../../admin/components/ArchiveKpiDialog';
import UnarchiveKpiDialog from '../../admin/components/UnarchiveKpiDialog';
import SubmissionReviewBadge from '../../../kpisubmission/shared/components/SubmissionReviewBadge';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const simpleChipSx = {
  bgcolor: '#F8FAFC',
  border: '1px solid #E5E7EB',
  color: '#374151',
  fontWeight: 700,
};

const formatRoleLabel = (role: string) => {
  if (role === 'STAFF') return 'Member';
  if (role === 'TBI_MANAGER') return 'Committee Lead';
  return role.replaceAll('_', ' ');
};

type SubmissionHistoryRow = KpiPeriodHistoryResponse['periods'][number]['submissions'][number] & {
  rowKey: string;
};

const SubmissionRecordsTable = ({
  rows,
  unit,
  emptyMessage,
  showReview = false,
}: {
  rows: SubmissionHistoryRow[];
  unit: string;
  emptyMessage: string;
  showReview?: boolean;
}) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Table
      size="small"
      sx={{
        minWidth: showReview ? 780 : 700,
        '& th': {
          bgcolor: '#F8FAFC',
          color: '#64748B',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          borderBottom: '1px solid #E5E7EB',
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
          <TableCell>Reference</TableCell>
          <TableCell>Submission Date</TableCell>
          <TableCell>Organization</TableCell>
          <TableCell>Submitted by</TableCell>
          <TableCell>Value</TableCell>
          <TableCell>Achievement</TableCell>
          {showReview && <TableCell>Review</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showReview ? 7 : 6}>
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
                  {emptyMessage}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((submission, index) => (
            <TableRow
              key={submission.rowKey}
              sx={{
                bgcolor: index % 2 === 0 ? '#FFFFFF' : '#FBFDFF',
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {submission.referenceCode ?? submission.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {formatDate(submission.submissionDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                  {submission.organizationName ?? '--'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                    {submission.submittedByName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {formatRoleLabel(submission.submittedByRole)}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {formatMetricValue(submission.submittedValue)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {unit}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {formatMetricValue(submission.achievementRate)}%
                </Typography>
              </TableCell>
              {showReview && (
                <TableCell>
                  <SubmissionReviewBadge status={submission.reviewStatus} />
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Box>
);

const KpiDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const kpiId = Number(id);

  const roleMatch = location.pathname.match(/^\/dashboard\/(admin|staff|tbi_manager)/);
  const userRole = roleMatch ? roleMatch[1] : 'DASIG_ADMIN';
  const isAdmin = userRole === 'admin';

  const [kpi, setKpi] = useState<DashboardKpiItem | null>(null);
  const [history, setHistory] = useState<KpiPeriodHistoryResponse | null>(null);
  const [selectedOrganizationName, setSelectedOrganizationName] = useState<string | null>(null);
  const [isLoadingKpi, setIsLoadingKpi] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const loadKpi = async () => {
    setIsLoadingKpi(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboard(undefined);
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

  useEffect(() => {
    if (kpiId) {
      setSelectedOrganizationName(null);
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
    navigate(`/dashboard/admin/kpis/${kpiId}/edit`, { state: { kpi } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    showToast('KPI deleted successfully.', 'success');
    navigate('/dashboard/admin');
  };

  const handleArchiveSuccess = () => {
    setArchiveDialogOpen(false);
    showToast('KPI archived successfully.', 'success');
    void loadKpi();
  };

  const handleUnarchiveSuccess = () => {
    setUnarchiveDialogOpen(false);
    showToast('KPI restored to active status.', 'success');
    void loadKpi();
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

  const isArchived = Boolean(kpi.archived || kpi.kpiStatus === 'ARCHIVED');
  const isCommitteeLeadDetail = userRole === 'tbi_manager';
  const showOrganizationAudit = isAdmin || isCommitteeLeadDetail;
  const submissionRows =
    history?.periods.flatMap((period) =>
      period.submissions.map((submission) => ({
        ...submission,
        rowKey: `${period.reportingPeriod}-${submission.id}`,
      }))
    ) ?? [];
  const derivedBreakdownMap = submissionRows
    .filter((submission) => submission.submissionType === 'FINAL')
    .reduce((map, submission) => {
      const organizationName = submission.organizationName ?? 'Unassigned organization';
      const existing = map.get(organizationName);
      const submittedValue = (existing?.submittedValue ?? 0) + submission.submittedValue;
      map.set(organizationName, {
        organizationName,
        submittedValue,
        achievementRate: kpi.targetValue > 0 ? (submittedValue / kpi.targetValue) * 100 : 0,
      });
      return map;
    }, new Map<string, { organizationName: string; submittedValue: number; achievementRate: number }>());
  const organizationBreakdowns =
    isCommitteeLeadDetail && kpi.organizationBreakdowns && kpi.organizationBreakdowns.length > 0
      ? kpi.organizationBreakdowns
      : [...derivedBreakdownMap.values()];
  const filteredSubmissionRows = selectedOrganizationName
    ? submissionRows.filter((submission) => (submission.organizationName ?? 'Unassigned organization') === selectedOrganizationName)
    : submissionRows;
  const officialFinalRows = filteredSubmissionRows.filter((submission) => submission.submissionType === 'FINAL');

  return (
    <AdminPageLayout>
      <Stack spacing={3}>
        <DashboardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <span>{kpi.name}</span>
              {isArchived && (
                <Chip
                  label="Archived"
                  size="small"
                  sx={{
                    bgcolor: '#E2E8F0',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                />
              )}
            </Box>
          }
          subtitle={kpi.description}
        />

        {isAdmin && (
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            {!isArchived && (
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
            )}

            {!isArchived && (
              <Button
                variant="outlined"
                startIcon={<ArchiveOutlinedIcon />}
                onClick={() => setArchiveDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  borderColor: '#93C5FD',
                  color: '#1A73E8',
                  bgcolor: '#EFF6FF',
                  '&:hover': { borderColor: '#1A73E8', bgcolor: '#DBEAFE' },
                }}
              >
                Archive
              </Button>
            )}

            {isArchived && (
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlinedIcon />}
                onClick={() => setUnarchiveDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  borderColor: '#86EFAC',
                  color: '#16A34A',
                  bgcolor: '#F0FDF4',
                  '&:hover': { borderColor: '#16A34A', bgcolor: '#DCFCE7' },
                }}
              >
                Restore KPI
              </Button>
            )}

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

        {isArchived && (
          <Alert
            severity="info"
            icon={<ArchiveOutlinedIcon />}
            sx={{
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontWeight: 500,
              fontSize: '0.9rem',
              '& .MuiAlert-icon': { color: '#64748B' },
            }}
          >
            This KPI is currently archived. Member submissions and deadline alerts are paused. Click <strong>Restore KPI</strong> above to reactivate active monitoring.
          </Alert>
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
                {kpi.status === 'COMPLETED' ? 'Completed' : kpi.status === 'ON_TRACK' ? 'In progress' : kpi.status === 'AT_RISK' ? 'At risk' : 'Overdue'}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Submission History
          </Typography>

          {isLoadingHistory ? (
            <Stack sx={{ py: 4, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : error || !history ? (
            <Alert severity="error">Unable to load submission history.</Alert>
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
                Official final submissions with organization audit details.
              </Typography>

              <KpiProgressChart history={history} role="DASIG_ADMIN" />

              {showOrganizationAudit && (
                <Box
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                    overflow: 'hidden',
                  }}
                >
                  <Stack spacing={0.5} sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                      Organization Breakdown
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Click an organization to filter the records below.
                    </Typography>
                  </Stack>

                  {organizationBreakdowns.length === 0 ? (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        No organization breakdown available for this KPI yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.25} sx={{ p: 2 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        onClick={() => setSelectedOrganizationName(null)}
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: { sm: 'center' },
                          cursor: 'pointer',
                          borderRadius: 2,
                          p: 1,
                          bgcolor: selectedOrganizationName === null ? '#F8FAFC' : 'transparent',
                          '&:hover': { bgcolor: '#F8FAFC' },
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                          All Organizations
                        </Typography>
                        <Chip label="Showing all records" size="small" sx={simpleChipSx} />
                      </Stack>
                      {organizationBreakdowns.map((breakdown) => (
                        <Stack
                          key={breakdown.organizationName}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          onClick={() => setSelectedOrganizationName(breakdown.organizationName)}
                          sx={{
                            justifyContent: 'space-between',
                            alignItems: { sm: 'center' },
                            cursor: 'pointer',
                            borderRadius: 2,
                            p: 1,
                            bgcolor: selectedOrganizationName === breakdown.organizationName ? '#F8FAFC' : 'transparent',
                            '&:hover': { bgcolor: '#F8FAFC' },
                          }}
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
                  )}
                </Box>
              )}

              <Stack spacing={2}>
                <Box>
                  <Stack spacing={0.25} sx={{ mb: 1.25 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                      Official Final Records
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Records that affect official dashboard progress.
                    </Typography>
                  </Stack>
                  <SubmissionRecordsTable
                    rows={officialFinalRows}
                    unit={history.unit}
                    emptyMessage="No official final records found for this selection."
                    showReview={isCommitteeLeadDetail}
                  />
                </Box>

              </Stack>

              {history.periods.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No submission history is available for this KPI yet.
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>

      {isAdmin && (
        <>
          <ArchiveKpiDialog
            open={archiveDialogOpen}
            onClose={() => setArchiveDialogOpen(false)}
            onSubmitSuccess={handleArchiveSuccess}
            kpiId={kpi.id}
            kpiName={kpi.name}
          />

          <UnarchiveKpiDialog
            open={unarchiveDialogOpen}
            onClose={() => setUnarchiveDialogOpen(false)}
            onSubmitSuccess={handleUnarchiveSuccess}
            kpiId={kpi.id}
            kpiName={kpi.name}
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
