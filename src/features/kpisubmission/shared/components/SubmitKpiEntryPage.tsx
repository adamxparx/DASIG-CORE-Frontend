import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { kpiSubmissionService } from '../../api/kpiSubmissionService';
import {
  getCurrentPeriod,
  getExpectedPeriodValue,
  getPeriodOptions,
  isFuturePeriod,
  sumPreviousPeriodValues,
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

const SubmitKpiEntryPage = ({ role }: SubmitKpiEntryPageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use local date (not UTC) to avoid timezone mismatch with the server (+08:00).
  // toISOString() returns UTC which is "yesterday" during the first 8 hours of local time.
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  const [assignableKpis, setAssignableKpis] = useState<AssignableKpi[]>([]);
  const [submissions, setSubmissions] = useState<KpiSubmissionResponse[]>([]);
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
    const loadKpis = async () => {
      setIsLoadingKpis(true);
      try {
        const [data, submissionData] = await Promise.all([
          kpiSubmissionService.getAssignableKpis(),
          kpiSubmissionService.getSubmissions(),
        ]);
        const finalSubmissionData = role === 'STAFF'
          ? await kpiSubmissionService.getSubmissions({ submissionType: 'FINAL' })
          : [];
        setAssignableKpis(data);
        setSubmissions([...submissionData, ...finalSubmissionData]);
        setSelectedKpiId('');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load assigned KPIs.', 'error');
      } finally {
        setIsLoadingKpis(false);
      }
    };

    void loadKpis();
  }, [role, showToast]);

  const selectedKpi = assignableKpis.find((kpi) => kpi.id === selectedKpiId) ?? null;
  const submissionDateMin = today;
  const periodOptions = useMemo(() => {
    if (!selectedKpi) {
      return [];
    }
    return getPeriodOptions(selectedKpi.reportingFrequency ?? 'QUARTERLY', selectedKpi.deadline);
  }, [selectedKpi]);
  const submissionType = role === 'STAFF' ? 'INTERNAL' : 'FINAL';

  const applyTbiPrefill = (kpi: AssignableKpi | null, nextPeriod: string, nextSubmissionDate: string) => {
    if (role !== 'TBI_MANAGER') {
      return;
    }

    if (!kpi || !nextPeriod) {
      return;
    }

    const tbiFinalSubmission = submissions.find((submission) =>
      submission.kpiDefinitionId === kpi.id &&
      submission.reportingPeriod === nextPeriod &&
      submission.submissionType === 'FINAL'
    );
    if (tbiFinalSubmission) {
      return;
    }

    const staffInternalSubmission = submissions.find((submission) =>
      submission.kpiDefinitionId === kpi.id &&
      submission.reportingPeriod === nextPeriod &&
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

  const handlePeriodChange = (nextPeriod: string) => {
    setPeriod(nextPeriod);
    if (selectedKpi && role === 'TBI_MANAGER') {
      applyTbiPrefill(
        selectedKpi,
        nextPeriod,
        getDefaultSubmissionDateForKpi(selectedKpi, today)
      );
    }
  };

  const numericSubmittedValue = Number(submittedValue) || 0;
  const relatedSubmissions = selectedKpi
    ? submissions.filter((submission) =>
        submission.kpiDefinitionId === selectedKpi.id && submission.submissionType === submissionType
      )
    : [];
  const previousSubmittedValue = sumPreviousPeriodValues(relatedSubmissions, periodOptions, period);
  const cumulativeSubmittedValue = previousSubmittedValue + numericSubmittedValue;
  const expectedTargetValue = selectedKpi
    ? getExpectedPeriodValue(selectedKpi.targetValue, periodOptions, period)
    : 0;
  const expectedThresholdValue = selectedKpi
    ? getExpectedPeriodValue(selectedKpi.threshold, periodOptions, period)
    : 0;
  const achievementRate =
    selectedKpi && expectedTargetValue > 0
      ? (cumulativeSubmittedValue / expectedTargetValue) * 100
      : 0;

  const helperMessage =
    selectedKpi?.reportingFrequency !== 'ONE_TIME' && cumulativeSubmittedValue < expectedThresholdValue
      ? `Cumulative progress is below the expected threshold for ${period}.`
      : `Cumulative progress is on track for ${period || 'the selected period'}.`;

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected: ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length > 0) {
      setFiles((current) => [...current, ...nextFiles].slice(0, 5));
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

    if (!period) {
      showToast('Please select a reporting period.', 'error');
      return;
    }

    if (!submissionDate) {
      showToast('Please select a submission date.', 'error');
      return;
    }

    if (submissionDate < submissionDateMin) {
      showToast('Submission date cannot be before today.', 'error');
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
      setSubmissions((current) => [response, ...current]);
      showToast(getKpiSubmissionSuccessMessage(role, response), 'success');
      setSubmittedValue('');
      setNotes('');
      setFiles([]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to submit KPI entry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Box sx={{ minHeight: '100%', bgcolor: '#F7F8FB', p: { xs: 2, md: 4 } }}>
      <Stack spacing={2} sx={{ maxWidth: 1080, width: '100%', mx: 'auto' }}>
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

          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E5EC', overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#20242A' }}>
                    KPI Details & Entry
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Provide the final values and supporting documents for your assigned metric.
                  </Typography>
                </Box>

                {isLoadingKpis && <LinearProgress />}

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
                    select
                    fullWidth
                    label="Period"
                    value={period}
                    onChange={(event) => handlePeriodChange(event.target.value)}
                    disabled={!selectedKpi || periodOptions.length === 0}
                    helperText={
                      selectedKpi
                        ? selectedKpi.reportingFrequency === 'ONE_TIME'
                          ? 'Submit anytime before the deadline'
                          : `${selectedKpi.reportingFrequency.replace('_', ' ').toLowerCase()} reporting`
                        : undefined
                    }
                  >
                    {periodOptions.map((option) => {
                      const disabled = isFuturePeriod(selectedKpi?.reportingFrequency ?? 'QUARTERLY', option);
                      return (
                      <MenuItem key={option} value={option} disabled={disabled}>
                        {disabled ? `${option} (future period)` : option}
                      </MenuItem>
                      );
                    })}
                  </TextField>
                </Stack>

                <Paper elevation={0} sx={{ bgcolor: '#F6F7FA', border: '1px solid #ECEEF3', borderRadius: 2.5, p: 2 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <FlagOutlinedIcon sx={{ color: '#5B61D9' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#5F6672', fontWeight: 600 }}>
                          Target Overview
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329' }}>
                          {formatMetricValue(selectedKpi?.targetValue ?? 0)} <Typography component="span">{selectedKpi?.unit ?? '-'}</Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7A8090', display: 'block', mt: 0.25 }}>
                          Period target: {formatMetricValue(expectedTargetValue)} {selectedKpi?.unit ?? '-'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="caption" sx={{ color: '#7A8090', letterSpacing: 1 }}>
                        DEADLINE
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2329' }}>
                        {selectedKpi ? formatDeadline(selectedKpi.deadline) : '--'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Value Achieved This Period"
                    value={submittedValue}
                    onChange={(event) => setSubmittedValue(event.target.value)}
                    helperText="Enter only the value achieved during the selected reporting period."
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
                        ? 'Select submission date (can be submitted before or after the deadline).'
                        : undefined
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        min: selectedKpi ? submissionDateMin : undefined,
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
                    <Typography sx={{ color: '#1F2329', mb: 0.5 }}>Click to upload or drag and drop</Typography>
                    <Typography variant="caption" sx={{ color: '#8A91A1', display: 'block', mb: 1.5 }}>
                      SVG, PNG, JPG or PDF (max. 10MB)
                    </Typography>
                    <Button variant="outlined" onClick={handlePickFiles}>
                      Browse Files
                    </Button>
                    <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />
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
            </Box>

            <Divider />

            <Stack direction="row" sx={{ px: { xs: 2, md: 3 }, py: 2, justifyContent: 'space-between' }}>
              <Button color="inherit">Cancel</Button>

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" disabled>
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoadingKpis || !selectedKpi || !period}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit KPI'}
                </Button>
              </Stack>
            </Stack>
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
