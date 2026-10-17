import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { kpiSubmissionService } from '../../api/kpiSubmissionService';
import { dashboardService } from '../../../dashboard/shared/api/dashboardService';
import type { DashboardKpiItem } from '../../../dashboard/shared/types/dashboard.types';
import {
  getCurrentPeriod,
  getPeriodOptions,
  isFuturePeriod,
} from '../utils/reportingPeriodUtils';
import { getKpiSubmissionSuccessMessage } from '../utils/submissionMessages';
import type {
  AssignableKpi,
  CreateKpiSubmissionRequest,
  KpiSubmissionResponse,
} from '../../types/kpiSubmission.types';

type SubmissionRole = 'STAFF' | 'TBI_MANAGER';

interface SubmitKpiEntryPageProps {
  role: SubmissionRole;
}

const formatDeadline = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'xlsx', 'xls', 'csv']);
const ALLOWED_UPLOAD_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
]);
const ACCEPTED_UPLOAD_FORMATS = '.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv';

const getSelectablePeriodOptionsForKpi = (kpi: AssignableKpi) => {
  const frequency = kpi.reportingFrequency ?? 'QUARTERLY';
  return getPeriodOptions(frequency, kpi.deadline).filter((option) => !isFuturePeriod(frequency, option));
};

const getDefaultPeriodForKpi = (kpi: AssignableKpi) => {
  const frequency = kpi.reportingFrequency ?? 'QUARTERLY';
  const selectableOptions = getSelectablePeriodOptionsForKpi(kpi);
  const currentPeriod = getCurrentPeriod(frequency, kpi.deadline);
  return currentPeriod && selectableOptions.includes(currentPeriod)
    ? currentPeriod
    : selectableOptions[selectableOptions.length - 1] ?? '';
};

const getDefaultSubmissionDateForKpi = (_kpi: AssignableKpi, today: string) => today;

const getDateOnly = (rawDate?: string) => rawDate?.slice(0, 10) ?? '';

const getKpiCreationDate = (kpi: AssignableKpi, today: string) => {
  const creationDate = getDateOnly(kpi.createdAt);
  return creationDate && creationDate <= today ? creationDate : today;
};

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? '';

const isAllowedUploadFile = (file: File) =>
  ALLOWED_UPLOAD_TYPES.has(file.type) || ALLOWED_UPLOAD_EXTENSIONS.has(getFileExtension(file.name));

const getUploadValidationError = (files: File[]) => {
  if (files.some((file) => file.size === 0)) {
    return 'Uploaded files cannot be empty.';
  }

  if (files.some((file) => file.size > MAX_UPLOAD_SIZE_BYTES)) {
    return 'Each uploaded file must be 10 MB or smaller.';
  }

  if (files.some((file) => !isAllowedUploadFile(file))) {
    return 'Unsupported file type. Please upload PDF, PNG, JPG, JPEG, XLSX, XLS, or CSV files only.';
  }

  return null;
};

const getSubmitErrorMessage = (err: unknown) => {
  const fallback = 'Unable to submit KPI entry.';
  if (!(err instanceof Error) || !err.message) {
    return fallback;
  }

  const message = err.message.trim();
  if (!message || message === 'Internal Server Error') {
    return fallback;
  }

  if (message.startsWith('{')) {
    try {
      const body = JSON.parse(message) as {
        message?: string;
        detail?: string;
        error?: string;
      };
      const parsedMessage = body.message ?? body.detail ?? body.error;
      return parsedMessage && parsedMessage !== 'Internal Server Error' ? parsedMessage : fallback;
    } catch {
      return fallback;
    }
  }

  return message;
};

const dedupeSubmissions = (items: KpiSubmissionResponse[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

const SubmitKpiEntryPage = ({ role }: SubmitKpiEntryPageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use local date (not UTC) to avoid timezone mismatch with the server (+08:00).
  // toISOString() returns UTC which is "yesterday" during the first 8 hours of local time.
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  const [assignableKpis, setAssignableKpis] = useState<AssignableKpi[]>([]);
  const [submissions, setSubmissions] = useState<KpiSubmissionResponse[]>([]);
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpiItem[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [selectedKpiId, setSelectedKpiId] = useState<number | ''>('');
  const [period, setPeriod] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  const [submissionDate, setSubmissionDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const showToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  }, []);

  useEffect(() => {
    let active = true;

    const loadKpis = async () => {
      setIsLoadingKpis(true);
      try {
        const [data, submissionData, dashboardData] = await Promise.all([
          kpiSubmissionService.getAssignableKpis(),
          kpiSubmissionService.getSubmissions(),
          dashboardService.getDashboard(),
        ]);

        if (!active) return;

        setAssignableKpis(data);
        setDashboardKpis(dashboardData.kpis ?? []);
        setSubmissions(dedupeSubmissions(submissionData));
        setSelectedKpiId((prev) => {
          if (prev === '') return '';
          return data.some((kpi) => kpi.id === prev) ? prev : '';
        });
      } catch (err) {
        if (!active) return;
        showToast(err instanceof Error ? err.message : 'Failed to load assigned KPIs.', 'error');
      } finally {
        if (active) {
          setIsLoadingKpis(false);
        }
      }
    };

    void loadKpis();

    return () => {
      active = false;
    };
  }, [role, showToast]);

  const selectedKpi = assignableKpis.find((kpi) => kpi.id === selectedKpiId) ?? null;
  const submissionDateMin = selectedKpi ? getKpiCreationDate(selectedKpi, today) : today;
  const applyTbiPrefill = (kpi: AssignableKpi | null, nextPeriod: string, nextSubmissionDate: string) => {
    if (role !== 'TBI_MANAGER' || !kpi || !nextPeriod) {
      return;
    }

    const isOneTime = kpi.reportingFrequency === 'ONE_TIME';
    const tbiFinalSubmission = submissions.find((submission) =>
      submission.kpiDefinitionId === kpi.id &&
      (isOneTime || submission.reportingPeriod === nextPeriod) &&
      submission.submissionType === 'FINAL'
    );
    if (tbiFinalSubmission) {
      return;
    }

    const staffInternalSubmission = submissions.find((submission) =>
      submission.kpiDefinitionId === kpi.id &&
      (isOneTime || submission.reportingPeriod === nextPeriod) &&
      submission.submissionType === 'INTERNAL'
    );
    if (!staffInternalSubmission) {
      return;
    }

    setSubmittedValue(String(staffInternalSubmission.submittedValue));
    setSubmissionDate(nextSubmissionDate);
    setNotes(staffInternalSubmission.notes ?? '');
  };

  const handleKpiChange = (nextValue: string | number) => {
    if (nextValue === '') {
      setSelectedKpiId('');
      setPeriod('');
      setSubmittedValue('');
      setSubmissionDate(today);
      setNotes('');
      setFiles([]);
      return;
    }

    const nextKpiId = Number(nextValue);
    const nextKpi = assignableKpis.find((kpi) => kpi.id === nextKpiId) ?? null;
    const nextPeriod = nextKpi ? getDefaultPeriodForKpi(nextKpi) : '';
    const nextSubmissionDate = nextKpi ? getDefaultSubmissionDateForKpi(nextKpi, today) : today;

    setSelectedKpiId(nextKpiId);
    setPeriod(nextPeriod);
    setSubmittedValue('');
    setSubmissionDate(nextSubmissionDate);
    setNotes('');
    setFiles([]);
    applyTbiPrefill(nextKpi, nextPeriod, nextSubmissionDate);
  };

  const numericSubmittedValue = Number(submittedValue) || 0;
  const selectedDashboardKpi = selectedKpi
    ? dashboardKpis.find((item) => item.id === selectedKpi.id) ?? null
    : null;
  const officialSubmittedTotal = selectedDashboardKpi?.submittedValue ?? 0;
  const overallTargetValue = selectedDashboardKpi?.overallTargetValue ?? selectedDashboardKpi?.targetValue ?? selectedKpi?.targetValue ?? 0;
  const projectedSubmittedTotal = officialSubmittedTotal + numericSubmittedValue;
  const remainingTargetValue = selectedKpi ? Math.max(overallTargetValue - projectedSubmittedTotal, 0) : 0;
  const achievementRate =
    selectedKpi && overallTargetValue > 0
      ? (projectedSubmittedTotal / overallTargetValue) * 100
      : 0;

  const helperMessage = selectedKpi
    ? role === 'STAFF'
      ? 'Projected progress if this submission is approved by the Committee Lead.'
      : 'Projected official progress after this final submission is saved.'
    : 'Select a KPI to preview overall achievement.';

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected: ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length > 0) {
      const validationError = getUploadValidationError(nextFiles);
      if (validationError) {
        showToast(validationError, 'error');
      }

      const validFiles = nextFiles.filter((file) => !getUploadValidationError([file]));
      if (validFiles.length > 0) {
        setFiles((current) => [...current, ...validFiles]);
      }
    }
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    setToastOpen(false);

    if (!selectedKpi) {
      showToast('Please select an assigned KPI.', 'error');
      return;
    }

    if (!submittedValue || Number.isNaN(Number(submittedValue))) {
      showToast('Please enter a valid submitted value.', 'error');
      return;
    }

    if (Number(submittedValue) < 0) {
      showToast('Submitted value must not be negative.', 'error');
      return;
    }

    if (!period) {
      showToast('Unable to determine the KPI deadline. Please reselect the KPI.', 'error');
      return;
    }

    if (!submissionDate) {
      showToast('Please select a submission date.', 'error');
      return;
    }

    if (submissionDate < submissionDateMin) {
      showToast('Submission date cannot be before the KPI creation date.', 'error');
      return;
    }

    if (submissionDate > today) {
      showToast('Submission date cannot be in the future.', 'error');
      return;
    }

    const uploadValidationError = getUploadValidationError(files);
    if (uploadValidationError) {
      showToast(uploadValidationError, 'error');
      return;
    }

    const payload: CreateKpiSubmissionRequest = {
      kpiDefinitionId: selectedKpi.id,
      reportingPeriod: period,
      submittedValue: Number(submittedValue),
      submissionDate,
      notes: notes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const response: KpiSubmissionResponse = await kpiSubmissionService.createSubmission(payload, files);
      setSubmissions((current) => dedupeSubmissions([response, ...current]));
      if (response.submissionType === 'FINAL') {
        setDashboardKpis((current) =>
          current.map((item) =>
            item.id === response.kpiDefinitionId
              ? { ...item, submittedValue: item.submittedValue + response.submittedValue }
              : item
          )
        );
      }
      showToast(getKpiSubmissionSuccessMessage(role, response), 'success');
      setSubmittedValue('');
      setNotes('');
      setFiles([]);
    } catch (err) {
      showToast(getSubmitErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Chip
              label={role === 'STAFF' ? 'Member' : 'Committee Lead'}
              size="small"
              sx={{ alignSelf: 'flex-start', bgcolor: '#ECECF8', color: '#4A4F7A', fontWeight: 600 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2329' }}>
              Submit KPI Entry
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
            {isLoadingKpis ? (
              <Stack spacing={3}>
                <Box>
                  <Skeleton variant="rounded" height={28} width={200} />
                  <Skeleton variant="rounded" height={18} width={420} sx={{ mt: 1 }} />
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Skeleton variant="rounded" height={56} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                  <Skeleton variant="rounded" height={56} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                </Stack>

                <Paper elevation={0} sx={{ bgcolor: '#F6F7FA', border: '1px solid #ECEEF3', borderRadius: 2.5, p: 2 }}>
                  <Skeleton variant="rounded" height={20} width={140} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" height={32} width="60%" />
                  <Skeleton variant="rounded" height={16} width="30%" sx={{ mt: 0.75 }} />
                </Paper>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Skeleton variant="rounded" height={56} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                  <Skeleton variant="rounded" height={56} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                </Stack>

                <Box>
                  <Skeleton variant="rounded" height={20} width={220} sx={{ mb: 1, alignSelf: 'flex-start' }} />
                  <Skeleton variant="rounded" height={8} sx={{ width: '100%', height: 8, borderRadius: 999, bgcolor: '#E8EBF2' }} />
                </Box>

                <Paper elevation={0} sx={{ border: '1px dashed #CFD5E1', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: '#FAFBFD' }}>
                  <Skeleton variant="circular" height={48} width={48} sx={{ mx: 'auto' }} />
                  <Skeleton variant="rounded" height={20} width={160} sx={{ mt: 1.5, mx: 'auto' }} />
                  <Skeleton variant="rounded" height={16} width={280} sx={{ mt: 1, mx: 'auto' }} />
                </Paper>

                <Skeleton variant="rounded" height={140} sx={{ width: '100%', bgcolor: 'grey.100' }} />

                <Paper elevation={0} sx={{ bgcolor: '#F8F9FC', border: '1px solid #E5E8F1', borderRadius: 2, p: 1.5 }}>
                  <Skeleton variant="rounded" height={20} width={320} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" height={16} width="90%" />
                  <Skeleton variant="rounded" height={16} width="80%" sx={{ mt: 0.5 }} />
                </Paper>

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                  <Skeleton variant="rounded" height={40} width={100} />
                  <Skeleton variant="rounded" height={40} width={110} />
                  <Skeleton variant="rounded" height={40} width={140} />
                </Stack>
              </Stack>
            ) : (
              <>
                <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#20242A' }}>
                    KPI Details & Entry
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Provide the final values and supporting documents for your assigned metric.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Assigned KPI"
                    value={selectedKpiId}
                    onChange={(event) => {
                      handleKpiChange(event.target.value);
                    }}
                    disabled={isLoadingKpis || assignableKpis.length === 0}
                  >
                    <MenuItem value="" disabled>
                      Select KPI
                    </MenuItem>
                    {assignableKpis.map((kpi) => (
                      <MenuItem key={kpi.id} value={kpi.id}>
                        {kpi.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Deadline"
                    value={selectedKpi ? formatDeadline(selectedKpi.deadline) : ''}
                    disabled
                    helperText={
                      selectedKpi
                        ? 'Submit anytime before this deadline.'
                        : undefined
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>

                <Box>
                  <Typography variant="body2" sx={{ color: '#5F6672', fontWeight: 600, mb: 1 }}>
                    Target Overview
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Paper elevation={0} sx={{ flex: 1, border: '1px solid #ECEEF3', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                        <FlagOutlinedIcon sx={{ color: '#5B61D9', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#7A8090', fontWeight: 700 }}>
                          Target Value
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329' }}>
                        {formatMetricValue(overallTargetValue)} <Typography component="span">{selectedKpi?.unit ?? '-'}</Typography>
                      </Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ flex: 1, border: '1px solid #ECEEF3', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
                      <Typography variant="caption" sx={{ color: '#7A8090', fontWeight: 700 }}>
                        Current Submitted Total
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329', mt: 0.75 }}>
                        {formatMetricValue(officialSubmittedTotal)} <Typography component="span">{selectedKpi?.unit ?? '-'}</Typography>
                      </Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ flex: 1, border: '1px solid #ECEEF3', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
                      <Typography variant="caption" sx={{ color: '#7A8090', fontWeight: 700 }}>
                        Remaining Target
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329', mt: 0.75 }}>
                        {formatMetricValue(remainingTargetValue)} <Typography component="span">{selectedKpi?.unit ?? '-'}</Typography>
                      </Typography>
                    </Paper>
                  </Stack>

                  <Typography variant="caption" sx={{ color: '#7A8090', display: 'block', mt: 1 }}>
                    Deadline: {selectedKpi ? formatDeadline(selectedKpi.deadline) : '--'}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Value Achieved This Submission"
                    value={submittedValue}
                    onChange={(event) => setSubmittedValue(event.target.value)}
                    helperText="Enter only the new value achieved for this KPI submission."
                    slotProps={{ input: { endAdornment: <Typography sx={{ color: '#8A91A1' }}>{selectedKpi?.unit ?? ''}</Typography> } }}
                  />
                  <TextField
                    fullWidth
                    label="Submission Date"
                    type="date"
                    value={submissionDate}
                    onChange={(event) => setSubmissionDate(event.target.value)}
                    disabled={!selectedKpi}
                    helperText={
                      selectedKpi
                        ? 'Select a date from the KPI creation date up to today.'
                        : undefined
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        min: selectedKpi ? submissionDateMin : undefined,
                        max: selectedKpi ? today : undefined,
                      },
                    }}
                  />
                </Stack>

                <Box>
                  <Stack direction="row" sx={{ mb: 0.75, justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, color: '#414B5A' }}>Cumulative Achievement Preview</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#5B61D9' }}>
                      {Math.max(0, Math.round(achievementRate * 10) / 10)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, achievementRate))}
                    sx={{ height: 8, borderRadius: 999, bgcolor: '#E8EBF2', '& .MuiLinearProgress-bar': { bgcolor: '#5B61D9' } }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.75, color: '#7D8594', display: 'block' }}>
                    {helperMessage}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography sx={{ mb: 1, fontWeight: 600, color: '#2B3340' }}>Supporting Documents</Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      border: '1px dashed #CFD5E1',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: '#FAFBFD',
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ color: '#696FDA', mb: 0.5 }} />
                    <Typography sx={{ color: '#1F2329', mb: 0.5 }}>Click to upload</Typography>
                    <Typography variant="caption" sx={{ color: '#8A91A1', display: 'block', mb: 1.5 }}>
                      PDF, PNG, JPG, JPEG, XLSX, XLS, or CSV (max. 10 MB each)
                    </Typography>
                    <Button variant="outlined" onClick={handlePickFiles}>
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      accept={ACCEPTED_UPLOAD_FORMATS}
                      onChange={handleFilesSelected}
                    />
                  </Paper>

                  <Stack spacing={1} sx={{ mt: 1.5 }}>
                    {files.map((file, index) => (
                      <Paper
                        key={`${file.name}-${index}`}
                        elevation={0}
                        sx={{
                          border: '1px solid #E1E6EF',
                          borderRadius: 1.5,
                          p: 1.25,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <DescriptionOutlinedIcon sx={{ color: '#5B61D9' }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.95rem', color: '#2A2F37' }}>{file.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#8A91A1' }}>
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </Typography>
                          </Box>
                        </Stack>
                        <Button size="small" onClick={() => handleRemoveFile(index)} sx={{ minWidth: 'unset', p: 0.5 }}>
                          <CloseIcon fontSize="small" />
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Submission Notes (Optional)"
                  placeholder="Provide any additional context, reasons for missing target, or highlights..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />

                <Paper elevation={0} sx={{ bgcolor: '#F8F9FC', border: '1px solid #E5E8F1', borderRadius: 2, p: 1.5 }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                    <InfoOutlinedIcon sx={{ color: '#6870DC', mt: 0.2 }} fontSize="small" />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: '#374151' }}>
                        {role === 'STAFF' ? 'Submissions require Committee Lead review' : 'Official final submissions'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {role === 'STAFF'
                          ? 'Your member submission will start as Pending. A Committee Lead can approve it for official progress or return it with comments.'
                          : 'Committee Lead submissions are saved as approved official final contributions for Admin dashboards and reports.'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  disabled
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoadingKpis || !selectedKpi || !period}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'Submit KPI'
                  )}
                </Button>
              </Stack>
                </>
              )}
            </Paper>
        </Stack>
    </Box>
    <Snackbar
      open={toastOpen}
      autoHideDuration={5000}
      onClose={() => setToastOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
        sx={{ borderRadius: 3, fontWeight: 600 }}
      >
        {toastMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default SubmitKpiEntryPage;
