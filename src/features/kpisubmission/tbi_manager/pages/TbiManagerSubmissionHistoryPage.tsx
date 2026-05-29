import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';

import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import CloseIcon from '@mui/icons-material/Close';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';

import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import SearchIcon from '@mui/icons-material/Search';

import Alert from '@mui/material/Alert';

import Avatar from '@mui/material/Avatar';

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

import { kpiSubmissionService } from '../../api/kpiSubmissionService';

import type { AssignableKpi, KpiSubmissionResponse, SubmissionDocumentResponse } from '../../types/kpiSubmission.types';



const PAGE_SIZE = 6;



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

  color: '#6B7280',

  fontSize: '0.8125rem',

  fontWeight: 600,

  borderBottom: '1px solid #E5E7EB',

  py: 1.75,

  px: 2.5,

  whiteSpace: 'nowrap',

  bgcolor: '#F9FAFB',

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



const primaryActionButtonSx = {

  textTransform: 'none',

  borderRadius: 2,

  bgcolor: '#6366F1',

  color: '#fff',

  fontWeight: 500,

  fontSize: '0.875rem',

  px: 2,

  py: 0.85,

  boxShadow: 'none',

  '&:hover': {

    bgcolor: '#5558E3',

    boxShadow: 'none',

  },

};



const sectionLabelSx = {

  fontWeight: 700,

  fontSize: '0.72rem',

  letterSpacing: '0.06em',

  color: '#6B7280',

  lineHeight: 1.6,

};



const formatSubmissionId = (id: number) => `SUB-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;

type DocumentPreview = {
  document: SubmissionDocumentResponse;
  kind: 'image' | 'pdf' | 'text';
  url?: string;
  text?: string;
};

const isImageDocument = (document: SubmissionDocumentResponse) => document.contentType.startsWith('image/');

const isPdfDocument = (document: SubmissionDocumentResponse) => document.contentType === 'application/pdf';

const isTextDocument = (document: SubmissionDocumentResponse) =>
  document.contentType.startsWith('text/') ||
  document.contentType === 'text/csv' ||
  document.contentType === 'application/csv';



const mapStatus = (status: string) => {

  if (status === 'GREEN') {

    return { label: 'On Track', bg: '#DDF4E8', color: '#14945F', achievementColor: '#14945F' };

  }

  if (status === 'YELLOW') {

    return { label: 'At Risk', bg: '#FFF1D6', color: '#B06000', achievementColor: '#D97706' };

  }

  return { label: 'Delayed', bg: '#FFE2E2', color: '#C62828', achievementColor: '#DC2626' };

};



const getInitials = (name?: string) => {

  if (!name) return 'U';

  return name

    .split(' ')

    .slice(0, 2)

    .map((part) => part.charAt(0).toUpperCase())

    .join('');

};



const TbiManagerSubmissionHistoryPage = () => {

  const [search, setSearch] = useState('');

  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | string>('ALL');

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | string>('ALL');

  const [selectedKpiName, setSelectedKpiName] = useState<'ALL' | string>('ALL');

  const [submissions, setSubmissions] = useState<KpiSubmissionResponse[]>([]);

  const [assignableKpis, setAssignableKpis] = useState<AssignableKpi[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSubmission, setSelectedSubmission] = useState<KpiSubmissionResponse | null>(null);

  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);

  const [documentError, setDocumentError] = useState<string | null>(null);

  const [isDocumentLoading, setIsDocumentLoading] = useState(false);



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



  const periodOptions = useMemo(() => ['ALL', ...new Set(submissions.map((item) => item.reportingPeriod))], [submissions]);



  const kpiOptions = useMemo(() => ['ALL', ...new Set(submissions.map((item) => item.kpiName))], [submissions]);



  const filteredSubmissions = useMemo(() => {

    const normalized = search.trim().toLowerCase();

    return submissions.filter((submission) => {

      if (selectedPeriod !== 'ALL' && submission.reportingPeriod !== selectedPeriod) return false;

      if (selectedStatus !== 'ALL' && mapStatus(submission.performanceStatus).label !== selectedStatus) return false;

      if (selectedKpiName !== 'ALL' && submission.kpiName !== selectedKpiName) return false;



      if (!normalized) return true;

      return (

        submission.kpiName.toLowerCase().includes(normalized) ||

        (submission.submittedByName ?? '').toLowerCase().includes(normalized) ||

        formatSubmissionId(submission.id).toLowerCase().includes(normalized)

      );

    });

  }, [search, selectedPeriod, selectedStatus, selectedKpiName, submissions]);



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

    const header = [

      'submissionId',

      'staffMember',

      'kpiName',

      'period',

      'submitted',

      'target',

      'achievement',

      'status',

    ];

    const rows = filteredSubmissions.map((submission) => {

      const kpiMeta = assignableById.get(submission.kpiDefinitionId);

      return [

        formatSubmissionId(submission.id),

        submission.submittedByName ?? 'Unknown',

        submission.kpiName,

        submission.reportingPeriod,

        String(submission.submittedValue),

        String(kpiMeta?.targetValue ?? ''),

        `${(submission.achievementRate ?? 0).toFixed(1)}%`,

        mapStatus(submission.performanceStatus).label,

      ];

    });



    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = 'organization-submission-history.csv';

    link.click();

    URL.revokeObjectURL(url);

  };

  const clearDocumentPreview = useCallback(() => {
    setDocumentPreview((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }
      return null;
    });
  }, []);

  const downloadDocumentBlob = useCallback(async (document: SubmissionDocumentResponse) => {
    const blob = await kpiSubmissionService.downloadDocument(document.id);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDocumentClick = useCallback(async (document: SubmissionDocumentResponse) => {
    setDocumentError(null);
    setIsDocumentLoading(true);
    clearDocumentPreview();

    try {
      const blob = await kpiSubmissionService.downloadDocument(document.id);

      if (isImageDocument(document)) {
        setDocumentPreview({ document, kind: 'image', url: URL.createObjectURL(blob) });
        return;
      }

      if (isPdfDocument(document)) {
        setDocumentPreview({ document, kind: 'pdf', url: URL.createObjectURL(blob) });
        return;
      }

      if (isTextDocument(document)) {
        setDocumentPreview({ document, kind: 'text', text: await blob.text() });
        return;
      }

      await downloadDocumentBlob(document);
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Unable to open supporting document.');
    } finally {
      setIsDocumentLoading(false);
    }
  }, [clearDocumentPreview, downloadDocumentBlob]);

  const handleModalExport = useCallback(async () => {
    if (!selectedSubmission || selectedSubmission.documents.length === 0) {
      return;
    }

    setDocumentError(null);
    setIsDocumentLoading(true);
    try {
      await downloadDocumentBlob(selectedSubmission.documents[0]);
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Unable to export supporting document.');
    } finally {
      setIsDocumentLoading(false);
    }
  }, [downloadDocumentBlob, selectedSubmission]);

  const handleCloseDetails = useCallback(() => {
    clearDocumentPreview();
    setDocumentError(null);
    setSelectedSubmission(null);
  }, [clearDocumentPreview]);



  return (

    <>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#F7F8FB' }}>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3.5, lg: 4 } }}>

          <Stack spacing={3} sx={{ maxWidth: 1280, mx: 'auto' }}>

            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>

              <Box>

                <Typography

                  variant="h4"

                  sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '1.65rem', md: '1.85rem' }, lineHeight: 1.2 }}

                >

                  Submission History

                </Typography>

                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.75, lineHeight: 1.6 }}>

                  Review and manage KPI data submissions from your organization&apos;s staff.

                </Typography>

              </Box>



              <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>

                <Button

                  variant="outlined"

                  startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}

                  onClick={handleExportCsv}

                  sx={outlinedActionButtonSx}

                >

                  Export CSV

                </Button>

                <Button

                  variant="contained"

                  startIcon={<RefreshOutlinedIcon sx={{ fontSize: 18 }} />}

                  onClick={() => void loadData()}

                  sx={primaryActionButtonSx}

                >

                  Refresh

                </Button>

              </Stack>

            </Stack>



            <Paper

              elevation={0}

              sx={{ border: '1px solid #E2E5EC', borderRadius: 2.5, p: { xs: 1.5, md: 2 }, bgcolor: '#fff' }}

            >

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { lg: 'center' } }}>

                <TextField

                  placeholder="Search by ID, Staff, or KPI..."

                  value={search}

                  onChange={(event) => setSearch(event.target.value)}

                  fullWidth

                  sx={{ flex: 1.4, ...inputFieldSx }}

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



                <Chip

                  icon={<FilterListOutlinedIcon sx={{ fontSize: 16 }} />}

                  label="Filters"

                  variant="outlined"

                  sx={{

                    borderRadius: 2,

                    borderColor: '#E2E5EC',

                    bgcolor: '#fff',

                    color: '#374151',

                    fontWeight: 500,

                    fontSize: '0.875rem',

                    height: 40,

                    flexShrink: 0,

                    alignSelf: { xs: 'flex-start', lg: 'center' },

                    '& .MuiChip-icon': { color: '#6B7280' },

                  }}

                />



                <TextField

                  select

                  value={selectedPeriod}

                  onChange={(event) => setSelectedPeriod(event.target.value)}

                  sx={{ minWidth: { xs: '100%', lg: 150 }, ...inputFieldSx }}

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

                  sx={{ minWidth: { xs: '100%', lg: 140 }, ...inputFieldSx }}

                >

                  {['ALL', 'On Track', 'At Risk', 'Delayed'].map((status) => (

                    <MenuItem key={status} value={status}>

                      {status === 'ALL' ? 'All Status' : status}

                    </MenuItem>

                  ))}

                </TextField>

                <TextField

                  select

                  value={selectedKpiName}

                  onChange={(event) => setSelectedKpiName(event.target.value)}

                  sx={{ minWidth: { xs: '100%', lg: 160 }, ...inputFieldSx }}

                >

                  {kpiOptions.map((kpiName) => (

                    <MenuItem key={kpiName} value={kpiName}>

                      {kpiName === 'ALL' ? 'All KPIs' : kpiName}

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

              {isLoading && (

                <LinearProgress sx={{ height: 3, bgcolor: '#EEF0F4', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />

              )}

              {error && <Alert severity="error">{error}</Alert>}



              <TableContainer>

                <Table>

                  <TableHead>

                    <TableRow>

                      {[

                        'Submission ID',

                        'Staff Member',

                        'KPI Name',

                        'Period',

                        'Submitted / Target',

                        'Achiev. %',

                        'Status',

                      ].map((header) => (

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

                          <TableCell sx={{ ...tableBodyCellSx, fontWeight: 600, color: '#111827' }}>

                            {formatSubmissionId(submission.id)}

                          </TableCell>

                          <TableCell sx={tableBodyCellSx}>

                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>

                              <Avatar

                                sx={{

                                  width: 36,

                                  height: 36,

                                  bgcolor: '#EEF0FF',

                                  color: '#6366F1',

                                  fontSize: '0.8rem',

                                  fontWeight: 600,

                                }}

                              >

                                {getInitials(submission.submittedByName)}

                              </Avatar>

                              <Box>

                                <Typography sx={{ fontWeight: 600, lineHeight: 1.5, color: '#111827', fontSize: '0.875rem' }}>

                                  {submission.submittedByName ?? 'Unknown User'}

                                </Typography>

                                <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.5, display: 'block' }}>

                                  {submission.submittedByRole?.replace('_', ' ') ?? 'Staff'}

                                </Typography>

                              </Box>

                            </Stack>

                          </TableCell>

                          <TableCell sx={{ ...tableBodyCellSx, color: '#374151' }}>{submission.kpiName}</TableCell>

                          <TableCell sx={tableBodyCellSx}>{submission.reportingPeriod}</TableCell>

                          <TableCell sx={tableBodyCellSx}>

                            <Typography sx={{ fontWeight: 700, lineHeight: 1.5, color: '#111827' }}>

                              {submission.submittedValue}

                              {kpiMeta?.unit ? ` ${kpiMeta.unit}` : ''}

                            </Typography>

                            <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.5, display: 'block' }}>

                              Target: {kpiMeta?.targetValue ?? '--'}

                              {kpiMeta?.unit ? ` ${kpiMeta.unit}` : ''}

                            </Typography>

                          </TableCell>

                          <TableCell sx={{ ...tableBodyCellSx, fontWeight: 700, color: status.achievementColor }}>

                            {(submission.achievementRate ?? 0).toFixed(0)}%

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

                      minWidth: 72,

                      px: 1.5,

                      py: 0.65,

                      borderRadius: 1.5,

                      border: '1px solid #E2E5EC',

                      color: currentPage === 1 ? '#C4C9D4' : '#6B7280',

                      fontWeight: 500,

                      fontSize: '0.8125rem',

                      bgcolor: '#fff',

                      boxShadow: 'none',

                      '&:hover': { bgcolor: '#F9FAFB', boxShadow: 'none' },

                    }}

                  >

                    Previous

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

                        bgcolor: currentPage === pageNumber ? '#6366F1' : '#fff',

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

                      minWidth: 60,

                      px: 1.5,

                      py: 0.65,

                      borderRadius: 1.5,

                      border: '1px solid #E2E5EC',

                      color: currentPage === totalPages ? '#C4C9D4' : '#6B7280',

                      fontWeight: 500,

                      fontSize: '0.8125rem',

                      bgcolor: '#fff',

                      boxShadow: 'none',

                      '&:hover': { bgcolor: '#F9FAFB', boxShadow: 'none' },

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

        onClose={handleCloseDetails}

        sx={{

          '& .MuiDrawer-paper': {

            width: { xs: '100%', sm: 560 },

            boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.08)',

            borderLeft: '1px solid #E2E5EC',

          },

        }}

      >

        {!selectedSubmission ? null : (

          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 3, sm: 4 } }}>

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>

                <Box>

                  <Typography

                    variant="h6"

                    sx={{ fontWeight: 700, color: '#111827', fontSize: '1.2rem', lineHeight: 1.4 }}

                  >

                    Submission Details

                  </Typography>

                  <Typography variant="body2" sx={{ color: '#9BA1AE', lineHeight: 1.7, mt: 0.5 }}>

                    ID: {formatSubmissionId(selectedSubmission.id)} •{' '}

                    {mapStatus(selectedSubmission.performanceStatus).label}

                  </Typography>

                </Box>

                <IconButton

                  onClick={handleCloseDetails}

                  sx={{

                    color: '#6B7280',

                    border: '1px solid #E2E5EC',

                    borderRadius: 2,

                    width: 36,

                    height: 36,

                    flexShrink: 0,

                    '&:hover': { bgcolor: '#F9FAFB' },

                  }}

                >

                  <CloseIcon sx={{ fontSize: 18 }} />

                </IconButton>

              </Stack>



              <Divider sx={{ borderColor: '#EEF0F4', my: 2.5 }} />



              <Stack spacing={3.5}>

                <Box>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.75 }}>

                    <PersonOutlineOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />

                    <Typography sx={sectionLabelSx}>SUBMITTER INFORMATION</Typography>

                  </Stack>

                  <Paper

                    variant="outlined"

                    sx={{ p: 2.5, borderRadius: 2.5, borderColor: '#E2E5EC', bgcolor: '#fff' }}

                  >

                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>

                      <Avatar

                        sx={{

                          width: 52,

                          height: 52,

                          bgcolor: '#EEF0FF',

                          color: '#6366F1',

                          fontSize: '1rem',

                          fontWeight: 600,

                        }}

                      >

                        {getInitials(selectedSubmission.submittedByName)}

                      </Avatar>

                      <Box>

                        <Typography sx={{ fontWeight: 700, lineHeight: 1.6, color: '#111827', fontSize: '1rem' }}>

                          {selectedSubmission.submittedByName ?? 'Unknown User'}

                        </Typography>

                        <Typography

                          variant="body2"

                          sx={{ color: '#6366F1', lineHeight: 1.6, fontWeight: 500, mt: 0.25 }}

                        >

                          {selectedSubmission.submittedByRole?.replace('_', ' ') ?? 'Staff'}

                        </Typography>

                        <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mt: 0.5 }}>

                          {selectedKpiMeta?.organizationName ?? 'Organization'}

                        </Typography>

                      </Box>

                    </Stack>

                  </Paper>

                </Box>



                <Box>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.75 }}>

                    <FlagOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />

                    <Typography sx={sectionLabelSx}>KPI METRICS</Typography>

                  </Stack>

                  <Paper

                    variant="outlined"

                    sx={{ p: 2.5, borderRadius: 2.5, borderColor: '#E2E5EC', bgcolor: '#fff' }}

                  >

                    <Typography sx={{ fontWeight: 700, lineHeight: 1.6, color: '#111827', fontSize: '0.95rem' }}>

                      {selectedSubmission.kpiName}

                    </Typography>

                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.75, mb: 2.5 }}>

                      <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#9BA1AE' }} />

                      <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>

                        Period: {selectedSubmission.reportingPeriod}

                      </Typography>

                    </Stack>



                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>

                      <Box>

                        <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mb: 0.75 }}>

                          Target Value

                        </Typography>

                        <Typography sx={{ fontWeight: 700, lineHeight: 1.6, color: '#111827', fontSize: '1.05rem' }}>

                          {selectedKpiMeta?.targetValue ?? '--'}

                          {selectedKpiMeta?.unit ? ` ${selectedKpiMeta.unit}` : ''}

                        </Typography>

                      </Box>

                      <Box>

                        <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mb: 0.75 }}>

                          Submitted Value

                        </Typography>

                        <Typography sx={{ fontWeight: 700, lineHeight: 1.6, color: '#6366F1', fontSize: '1.05rem' }}>

                          {selectedSubmission.submittedValue}

                          {selectedKpiMeta?.unit ? ` ${selectedKpiMeta.unit}` : ''}

                        </Typography>

                      </Box>

                    </Box>



                    <Divider sx={{ borderColor: '#EEF0F4', mb: 2 }} />



                    <Box>

                      <Typography variant="caption" sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mb: 0.5 }}>

                        Achievement Rate

                      </Typography>

                      <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6, mb: 1.25 }}>

                        {(selectedSubmission.achievementRate ?? 0).toFixed(1)}% of target met

                      </Typography>

                      <LinearProgress

                        variant="determinate"

                        value={Math.min(100, Math.max(0, selectedSubmission.achievementRate ?? 0))}

                        sx={{

                          height: 8,

                          borderRadius: 999,

                          bgcolor: '#EEF0FF',

                          '& .MuiLinearProgress-bar': {

                            borderRadius: 999,

                            bgcolor: '#6366F1',

                          },

                        }}

                      />

                    </Box>

                  </Paper>

                </Box>



                <Box>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.75 }}>

                    <AttachFileOutlinedIcon sx={{ fontSize: 16, color: '#6B7280' }} />

                    <Typography sx={sectionLabelSx}>SUPPORTING EVIDENCE</Typography>

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

                        onClick={() => void handleDocumentClick(document)}

                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          borderColor: '#E2E5EC',
                          bgcolor: '#fff',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#C7D2FE',
                            bgcolor: '#F8FAFF',
                          },
                        }}

                      >

                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>

                          <Box

                            sx={{

                              width: 40,

                              height: 40,

                              borderRadius: 2,

                              bgcolor: '#EEF0FF',

                              display: 'flex',

                              alignItems: 'center',

                              justifyContent: 'center',

                              flexShrink: 0,

                            }}

                          >

                            <DescriptionOutlinedIcon sx={{ color: '#6366F1', fontSize: 20 }} />

                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>

                            <Typography

                              noWrap

                              sx={{ fontWeight: 600, lineHeight: 1.5, color: '#111827', fontSize: '0.875rem' }}

                            >

                              {document.fileName}

                            </Typography>

                            <Typography

                              variant="caption"

                              sx={{ color: '#9BA1AE', lineHeight: 1.6, display: 'block', mt: 0.25 }}

                            >

                              {(document.fileSize / (1024 * 1024)).toFixed(1)} MB

                            </Typography>

                          </Box>

                        </Stack>

                      </Paper>

                    ))}

                  </Stack>

                  {isDocumentLoading && <LinearProgress sx={{ mt: 1.5 }} />}

                  {documentError && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                      {documentError}
                    </Alert>
                  )}

                  {documentPreview && (
                    <Paper
                      variant="outlined"
                      sx={{ mt: 1.5, borderRadius: 2.5, borderColor: '#E2E5EC', overflow: 'hidden' }}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, bgcolor: '#F9FAFB' }}
                      >
                        <Typography noWrap sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                          Preview: {documentPreview.document.fileName}
                        </Typography>
                        <IconButton size="small" onClick={clearDocumentPreview}>
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>

                      {documentPreview.kind === 'image' && documentPreview.url && (
                        <Box
                          component="img"
                          src={documentPreview.url}
                          alt={documentPreview.document.fileName}
                          sx={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block', bgcolor: '#fff' }}
                        />
                      )}

                      {documentPreview.kind === 'pdf' && documentPreview.url && (
                        <Box
                          component="iframe"
                          src={documentPreview.url}
                          title={documentPreview.document.fileName}
                          sx={{ width: '100%', height: 420, border: 0, display: 'block', bgcolor: '#fff' }}
                        />
                      )}

                      {documentPreview.kind === 'text' && (
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 1.5,
                            maxHeight: 360,
                            overflow: 'auto',
                            bgcolor: '#fff',
                            color: '#111827',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {documentPreview.text}
                        </Box>
                      )}
                    </Paper>
                  )}

                </Box>

              </Stack>

            </Box>



            <Box

              sx={{

                px: { xs: 3, sm: 4 },

                py: 2.5,

                borderTop: '1px solid #EEF0F4',

                bgcolor: '#fff',

              }}

            >

              <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'flex-end' }}>

                <Button

                  variant="outlined"

                  startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}

                  onClick={() => void handleModalExport()}

                  disabled={selectedSubmission.documents.length === 0 || isDocumentLoading}

                  sx={outlinedActionButtonSx}

                >

                  Export

                </Button>

                <Button

                  variant="outlined"

                  sx={{

                    ...outlinedActionButtonSx,

                    borderColor: '#FCA5A5',

                    color: '#DC2626',

                    '&:hover': {

                      borderColor: '#F87171',

                      bgcolor: '#FEF2F2',

                      boxShadow: 'none',

                    },

                  }}

                >

                  Return with Comment

                </Button>

              </Stack>

            </Box>

          </Box>

        )}

      </Drawer>

    </>

  );

};



export default TbiManagerSubmissionHistoryPage;


