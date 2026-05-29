import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardSidebar from '../../../dashboard/shared/components/DashboardSidebar';
import { kpiSubmissionService } from '../../api/kpiSubmissionService';
import type { AssignableKpi, KpiSubmissionResponse } from '../../types/kpiSubmission.types';

const PAGE_SIZE = 5;

const inputFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: '#E2E5EC' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
    '&.Mui-focused fieldset': { borderColor: '#A5B4FC' },
  },
};

const tableHeaderCellSx = {
  color: '#9BA1AE',
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  borderBottom: '1px solid #EEF0F4',
  py: 2,
  px: 2.5,
  whiteSpace: 'nowrap',
};

const tableBodyCellSx = {
  py: 2.25,
  px: 2.5,
  borderBottom: '1px solid #EEF0F4',
  fontSize: '0.875rem',
  color: '#374151',
};

const outlinedActionButtonSx = {
  textTransform: 'none',
  borderRadius: 2,
  borderColor: '#E2E5EC',
  color: '#374151',
  bgcolor: '#fff',
  fontWeight: 500,
  fontSize: '0.875rem',
  px: 2,
  py: 0.85,
  boxShadow: 'none',
  '&:hover': {
    borderColor: '#D1D5DB',
    bgcolor: '#FAFBFC',
    boxShadow: 'none',
  },
};

const formatSubmissionId = (id: number) => `#SUB-${String(id).padStart(4, '0')}`;
const formatDisplayDate = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });

const mapStatus = (status: string) => {
  if (status === 'GREEN') {
    return { label: 'On Track', bg: '#DDF4E8', color: '#14945F' };
  }
  if (status === 'YELLOW') {
    return { label: 'At Risk', bg: '#FFF1D6', color: '#B06000' };
  }
  return { label: 'Delayed', bg: '#FFE2E2', color: '#C62828' };
};

const StaffSubmissionHistoryPage = () => {
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | string>('ALL');
  const [submissions, setSubmissions] = useState<KpiSubmissionResponse[]>([]);
  const [assignableKpis, setAssignableKpis] = useState<AssignableKpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<KpiSubmissionResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [submissionData, assignableData] = await Promise.all([
        kpiSubmissionService.getSubmissions(),
        kpiSubmissionService.getAssignableKpis(),
      ]);
      setSubmissions(submissionData);
      setAssignableKpis(assignableData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const assignableById = useMemo(() => {
    return new Map(assignableKpis.map((item) => [item.id, item]));
  }, [assignableKpis]);

  const periodOptions = useMemo(() => {
    return ['ALL', ...new Set(submissions.map((item) => item.reportingPeriod))];
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      if (selectedPeriod !== 'ALL' && submission.reportingPeriod !== selectedPeriod) {
        return false;
      }

      if (selectedStatus !== 'ALL' && mapStatus(submission.performanceStatus).label !== selectedStatus) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        submission.kpiName.toLowerCase().includes(normalized) ||
        formatSubmissionId(submission.id).toLowerCase().includes(normalized) ||
        submission.reportingPeriod.toLowerCase().includes(normalized)
      );
    });
  }, [search, selectedPeriod, selectedStatus, submissions]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const pagedSubmissions = filteredSubmissions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedKpiMeta = selectedSubmission
    ? assignableById.get(selectedSubmission.kpiDefinitionId) ?? null
    : null;

  const handleExportCsv = () => {
    const header = ['subId', 'kpiName', 'period', 'submittedValue', 'targetValue', 'status', 'date'];
    const rows = filteredSubmissions.map((submission) => {
      const kpiMeta = assignableById.get(submission.kpiDefinitionId);
      return [
        formatSubmissionId(submission.id),
        submission.kpiName,
        submission.reportingPeriod,
        String(submission.submittedValue),
        String(kpiMeta?.targetValue ?? ''),
        mapStatus(submission.performanceStatus).label,
        formatDisplayDate(submission.submissionDate),
      ];
    });

    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'submission-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F8FB' }}>
      <DashboardSidebar role="STAFF" />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1, p: { xs: 2, md: 3.5, lg: 4 } }}>
          <Stack spacing={3} sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1.25,
                    py: 0.4,
                    mb: 1,
                    borderRadius: 999,
                    bgcolor: '#F3F4F8',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.4 }}
                  >
                    Staff Context
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '1.65rem', md: '1.85rem' }, lineHeight: 1.2 }}
                >
                  My Submission History
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.75, lineHeight: 1.6 }}>
                  View and track the status of your past KPI submissions.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshOutlinedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => void loadData()}
                  sx={outlinedActionButtonSx}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                  onClick={handleExportCsv}
                  sx={outlinedActionButtonSx}
                >
                  Export CSV
                </Button>
              </Stack>
            </Stack>

            <Paper
              elevation={0}
              sx={{ border: '1px solid #E2E5EC', borderRadius: 2.5, p: { xs: 1.5, md: 2 }, bgcolor: '#fff' }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  placeholder="Job Creation"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  sx={{ flex: 1.6, ...inputFieldSx }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#9BA1AE', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  select
                  value={selectedPeriod}
                  onChange={(event) => setSelectedPeriod(event.target.value)}
                  sx={{ minWidth: { xs: '100%', md: 180 }, ...inputFieldSx }}
                >
                  {periodOptions.map((period) => (
                    <MenuItem key={period} value={period}>
                      {period === 'ALL' ? 'All Periods' : period}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  sx={{ minWidth: { xs: '100%', md: 160 }, ...inputFieldSx }}
                >
                  {['ALL', 'On Track', 'At Risk', 'Delayed'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'ALL' ? 'All Status' : status}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                border: '1px solid #E2E5EC',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              }}
            >
              {isLoading && <LinearProgress sx={{ height: 3, bgcolor: '#EEF0F4', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />}
              {error && <Alert severity="error">{error}</Alert>}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['SUB ID', 'KPI NAME', 'PERIOD', 'VALUE', 'TARGET', 'STATUS', 'DATE'].map((header) => (
                        <TableCell key={header} sx={tableHeaderCellSx}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!isLoading && pagedSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ borderBottom: 0 }}>
                          <Typography sx={{ textAlign: 'center', py: 4, color: '#9BA1AE', lineHeight: 1.6 }}>
                            No submission records found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {pagedSubmissions.map((submission) => {
                      const kpiMeta = assignableById.get(submission.kpiDefinitionId);
                      const status = mapStatus(submission.performanceStatus);
                      return (
                        <TableRow
                          key={submission.id}
                          hover
                          onClick={() => setSelectedSubmission(submission)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            '&:hover': { bgcolor: '#FAFBFD' },
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell sx={{ ...tableBodyCellSx, color: '#6B7280', fontWeight: 600 }}>
                            {formatSubmissionId(submission.id)}
                          </TableCell>
                          <TableCell sx={{ ...tableBodyCellSx, fontWeight: 600, color: '#111827' }}>
                            {submission.kpiName}
                          </TableCell>
                          <TableCell sx={tableBodyCellSx}>{submission.reportingPeriod}</TableCell>
                          <TableCell sx={{ ...tableBodyCellSx, fontWeight: 700, color: '#111827' }}>
                            {submission.submittedValue}
                            {kpiMeta?.unit ? ` ${kpiMeta.unit}` : ''}
                          </TableCell>
                          <TableCell sx={tableBodyCellSx}>
                            {kpiMeta?.targetValue ?? '--'}
                            {kpiMeta?.unit ? ` ${kpiMeta.unit}` : ''}
                          </TableCell>
                          <TableCell sx={tableBodyCellSx}>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 26,
                                borderRadius: 999,
                                px: 0.5,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ ...tableBodyCellSx, color: '#6B7280' }}>
                            {formatDisplayDate(submission.submissionDate)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ borderColor: '#EEF0F4' }} />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ px: 2.5, py: 2, justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2" sx={{ color: '#9BA1AE', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                  Showing {pagedSubmissions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{' '}
                  {Math.min(currentPage * PAGE_SIZE, filteredSubmissions.length)} of {filteredSubmissions.length} entries
                </Typography>

                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    sx={{
                      textTransform: 'none',
                      minWidth: 52,
                      px: 1.5,
                      py: 0.65,
                      borderRadius: 1.5,
                      color: currentPage === 1 ? '#C4C9D4' : '#6B7280',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                    }}
                  >
                    Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      size="small"
                      onClick={() => setCurrentPage(pageNumber)}
                      sx={{
                        minWidth: 34,
                        width: 34,
                        height: 34,
                        p: 0,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: currentPage === pageNumber ? '#fff' : '#6B7280',
                        bgcolor: currentPage === pageNumber ? '#6366F1' : 'transparent',
                        border: currentPage === pageNumber ? 'none' : '1px solid #E2E5EC',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: currentPage === pageNumber ? '#5558E3' : '#F9FAFB',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {pageNumber}
                    </Button>
                  ))}

                  <Button
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    sx={{
                      textTransform: 'none',
                      minWidth: 52,
                      px: 1.5,
                      py: 0.65,
                      borderRadius: 1.5,
                      color: currentPage === totalPages ? '#C4C9D4' : '#6B7280',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                    }}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Box>

        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: '#9BA1AE',
            py: 2.5,
            px: 2,
            fontSize: '0.75rem',
            lineHeight: 1.6,
          }}
        >
          © 2026 TBI Management System. All rights reserved.
        </Typography>
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 540 },
            boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.08)',
            borderLeft: '1px solid #E2E5EC',
          },
        }}
      >
        {!selectedSubmission ? null : (
          <Box sx={{ p: { xs: 3, sm: 4 }, height: '100%', overflowY: 'auto' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#111827', fontSize: '1.2rem', lineHeight: 1.4 }}
                >
                  Submission Details
                </Typography>
                <Typography variant="body2" sx={{ color: '#9BA1AE', lineHeight: 1.7, mt: 0.5 }}>
                  ID: {formatSubmissionId(selectedSubmission.id)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                <Chip
                  label="Under Review"
                  size="small"
                  sx={{
                    bgcolor: '#FEF3C7',
                    color: '#B45309',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                    borderRadius: 999,
                    px: 0.5,
                  }}
                />
                <IconButton
                  onClick={() => setSelectedSubmission(null)}
                  sx={{
                    color: '#6B7280',
                    border: '1px solid #E2E5EC',
                    borderRadius: 2,
                    width: 36,
                    height: 36,
                    '&:hover': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Stack>

            <Stack spacing={3.5} sx={{ mt: 3.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9BA1AE',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    KPI NAME
                  </Typography>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.7, color: '#111827' }}>
                    {selectedSubmission.kpiName}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9BA1AE',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    PERIOD
                  </Typography>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.7, color: '#111827' }}>
                    {selectedSubmission.reportingPeriod}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9BA1AE',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    SUBMITTED VALUE
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.5, color: '#111827' }}>
                    {selectedSubmission.submittedValue}
                    {selectedKpiMeta?.unit ? ` ${selectedKpiMeta.unit}` : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9BA1AE',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    TARGET VALUE
                  </Typography>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.7, color: '#111827' }}>
                    {selectedKpiMeta?.targetValue ?? '--'}
                    {selectedKpiMeta?.unit ? ` ${selectedKpiMeta.unit}` : ''}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9BA1AE',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                      lineHeight: 1.6,
                    }}
                  >
                    ACHIEVEMENT
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.6 }}>
                    {(selectedSubmission.achievementRate ?? 0).toFixed(1)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, selectedSubmission.achievementRate ?? 0))}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: '#E6F7F4',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: '#14B8A6',
                    },
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: '#EEF0F4' }} />

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <DescriptionOutlinedIcon sx={{ color: '#374151', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.6 }}>
                    Supporting Documents
                  </Typography>
                </Stack>
                <Stack spacing={1.25}>
                  {selectedSubmission.documents.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#9BA1AE', lineHeight: 1.7 }}>
                      No supporting documents uploaded.
                    </Typography>
                  )}
                  {selectedSubmission.documents.map((document) => (
                    <Paper
                      key={document.id}
                      variant="outlined"
                      sx={{
                        p: 1.75,
                        borderRadius: 2.5,
                        borderColor: '#E2E5EC',
                        bgcolor: '#fff',
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: '#EEF0FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <DescriptionOutlinedIcon sx={{ color: '#5B61D9', fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            noWrap
                            sx={{ fontWeight: 600, lineHeight: 1.5, color: '#111827', fontSize: '0.9rem' }}
                          >
                            {document.fileName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mt: 0.25 }}>
                            {(document.fileSize / (1024 * 1024)).toFixed(1)} MB • {document.contentType || 'File'}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#6B7280',
                            border: '1px solid #E2E5EC',
                            borderRadius: 1.5,
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            '&:hover': { bgcolor: '#F9FAFB' },
                          }}
                        >
                          <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <ChatBubbleOutlineOutlinedIcon sx={{ color: '#374151', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.6 }}>
                    My Submission Notes
                  </Typography>
                </Stack>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: '#F4F3F8',
                    border: '1px solid #E8E6F0',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: selectedSubmission.notes ? 'italic' : 'normal',
                      color: '#4E5563',
                      lineHeight: 1.85,
                      fontSize: '0.9rem',
                    }}
                  >
                    {selectedSubmission.notes ? `"${selectedSubmission.notes}"` : 'No notes provided.'}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default StaffSubmissionHistoryPage;
