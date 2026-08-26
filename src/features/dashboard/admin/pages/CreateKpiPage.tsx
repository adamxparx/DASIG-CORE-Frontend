
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { kpiService } from '../../shared/api/kpiService';
import type {
  Committee,
  CreateKpiDefinitionRequest,
  ReportingFrequency,
  UpdateKpiDefinitionRequest,
} from '../../shared/types/kpi.types';
import { getDeadlineFieldHelperText } from '../../../notification/utils/notificationDisplay';
import { REPORTING_FREQUENCY_OPTIONS } from '../../../kpisubmission/shared/utils/reportingPeriodUtils';
import { routes } from '../../../../routes';

/* ─────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────── */

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateForInput = (rawDate: string): string => {
  if (!rawDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  try {
    const dateObj = new Date(rawDate);
    if (!Number.isNaN(dateObj.getTime())) {
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    }
  } catch {
    // fall through
  }
  return rawDate;
};

/* ─────────────────────────────────────────────
   Field label wrapper
───────────────────────────────────────────── */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
    {children} <span style={{ color: '#D93025' }}>*</span>
  </Typography>
);

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#FAFBFF',
    fontSize: '0.94rem',
  },
};

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */

const CreateKpiPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  /* ── Form state ─────────────────────────── */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [committeeId, setCommitteeId] = useState<number | ''>('');
  const [reportingFrequency, setReportingFrequency] = useState<ReportingFrequency>('QUARTERLY');

  /* ── UI / API state ─────────────────────── */
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoadingCommittees, setIsLoadingCommittees] = useState(false);
  const [isLoadingKpi, setIsLoadingKpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Toast state ────────────────────────── */
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  /* ── Load committees ────────────────────── */
  const loadCommittees = useCallback(async () => {
    setIsLoadingCommittees(true);
    try {
      const data = await kpiService.getCommittees();
      setCommittees(data);
      return data;
    } catch {
      setCommittees([]);
      return [] as Committee[];
    } finally {
      setIsLoadingCommittees(false);
    }
  }, []);

  /* ── Load existing KPI for edit ─────────── */
  const loadKpiForEdit = useCallback(
    async (loadedCommittees: Committee[]) => {
      if (!id) return;
      setIsLoadingKpi(true);
      try {
        const kpi = await kpiService.getKpiDefinitionById(Number(id));
        setName(kpi.name);
        setDescription(kpi.description);
        setTargetValue(String(kpi.targetValue));
        setUnit(kpi.unit);
        setDeadline(formatDateForInput(kpi.deadline));
        const kpiExt = kpi as typeof kpi & { threshold?: number; reportingFrequency?: ReportingFrequency };
        setThreshold(String(kpiExt.threshold ?? 80));
        setReportingFrequency(kpiExt.reportingFrequency ?? 'QUARTERLY');

        // Match by committeeId if available, else try committeeName
        const matched = loadedCommittees.find(
          (c) =>
            c.id === (kpi as typeof kpi & { committeeId?: number }).committeeId ||
            c.name.toLowerCase() === kpi.committeeName?.toLowerCase()
        );
        setCommitteeId(matched ? matched.id : '');
      } catch {
        setErrorMessage('Failed to load KPI data for editing.');
      } finally {
        setIsLoadingKpi(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const init = async () => {
      const loadedCommittees = await loadCommittees();
      if (isEdit) {
        await loadKpiForEdit(loadedCommittees);
      }
    };
    void init();
  }, [loadCommittees, loadKpiForEdit, isEdit]);

  /* ── Validation ─────────────────────────── */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'KPI Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!targetValue.trim()) {
      newErrors.targetValue = 'Target Value is required';
    } else if (isNaN(Number(targetValue)) || Number(targetValue) <= 0) {
      newErrors.targetValue = 'Target Value must be a number greater than 0';
    }
    if (!unit.trim()) newErrors.unit = 'Unit is required';
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(deadline);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) newErrors.deadline = 'Deadline cannot be a past date';
    }
    if (!threshold.trim()) {
      newErrors.threshold = 'Threshold is required';
    } else {
      const num = Number(threshold);
      if (isNaN(num) || num < 0 || num > 100)
        newErrors.threshold = 'Threshold must be a percentage between 0 and 100';
    }
    if (committeeId === '') newErrors.committeeId = 'Assigned Committee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ─────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const base = {
      name: name.trim(),
      description: description.trim(),
      targetValue: Number(targetValue),
      unit: unit.trim(),
      deadline,
      threshold: Number(threshold),
      reportingFrequency,
    };

    try {
      if (isEdit && id) {
        await kpiService.updateKpiDefinition(Number(id), base as UpdateKpiDefinitionRequest);
        showToast('KPI updated successfully.', 'success');
      } else {
        await kpiService.createKpiDefinition({
          ...base,
          committeeId: committeeId as number,
        } as CreateKpiDefinitionRequest);
        showToast('KPI created and assigned to the committee successfully.', 'success');
      }
      setTimeout(() => {
        navigate(routes.adminKpis);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading skeletons ──────────────────── */
  if (isLoadingKpi) {
    return (
      <Stack sx={{ minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    );
  }

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <Box sx={{ px: { xs: 3, sm: 5 }, py: { xs: 3, md: 4 }, maxWidth: 860 }}>

      {/* ── Page title ── */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: '#1A1C1E', fontSize: '1.65rem', mb: 0.5 }}
      >
        {isEdit ? 'Edit KPI' : 'Create New KPI'}
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3.5 }}>
        {isEdit
          ? 'Update the KPI details below. Committee assignment cannot be changed after creation.'
          : 'Fill in the details below to define a new KPI and assign it to a committee.'}
      </Typography>

      {/* ── Form ── */}
      <Box component="form" onSubmit={handleSubmit}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* KPI Name */}
          <Grid size={{ xs: 12 }}>
            <FieldLabel>KPI Name</FieldLabel>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="e.g., Number of Startups Incubated"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <FieldLabel>Description</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Describe the KPI and its purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          {/* Target Value & Unit */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Target Value</FieldLabel>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="100"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              error={!!errors.targetValue}
              helperText={errors.targetValue}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Unit</FieldLabel>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="startups, sessions, etc."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              error={!!errors.unit}
              helperText={errors.unit}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          {/* Deadline & Threshold */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Deadline</FieldLabel>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              error={!!errors.deadline}
              helperText={errors.deadline ?? getDeadlineFieldHelperText(deadline)}
              disabled={isSubmitting}
              hiddenLabel
              slotProps={{ htmlInput: { min: getTodayDateString() } }}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Threshold (%)</FieldLabel>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="80"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              error={!!errors.threshold}
              helperText={errors.threshold}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          {/* Reporting Frequency & Assigned Committee */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Reporting Frequency</FieldLabel>
            <FormControl fullWidth disabled={isSubmitting}>
              <Select
                value={reportingFrequency}
                onChange={(e) => setReportingFrequency(e.target.value as ReportingFrequency)}
                sx={{ borderRadius: 2, bgcolor: '#FAFBFF', fontSize: '0.94rem' }}
              >
                {REPORTING_FREQUENCY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Assigned Committee</FieldLabel>
            <FormControl
              fullWidth
              error={!!errors.committeeId}
              disabled={isSubmitting || isLoadingCommittees || isEdit}
            >
              <Select
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value as number)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: '#FAFBFF', fontSize: '0.94rem' }}
              >
                <MenuItem value="" disabled>
                  {isLoadingCommittees ? 'Loading committees...' : 'Select a committee...'}
                </MenuItem>
                {committees
                  .filter((c) => {
                    const isActive = !c.status || c.status.toLowerCase() === 'active';
                    const isCurrent = c.id === committeeId;
                    return isActive || isCurrent;
                  })
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
              {errors.committeeId && <FormHelperText>{errors.committeeId}</FormHelperText>}
              {isEdit ? (
                <FormHelperText>Committee assignment cannot be changed after creation.</FormHelperText>
              ) : (
                committeeId !== '' && (
                  <FormHelperText sx={{ color: 'text.secondary' }}>
                    This KPI will automatically be assigned to all active organizations under this committee.
                  </FormHelperText>
                )
              )}
            </FormControl>
          </Grid>
        </Grid>

        {/* ── Actions ── */}
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 4 }}>
          <Button
            onClick={() => navigate(routes.adminKpis)}
            disabled={isSubmitting}
            sx={{
              color: '#5F6368',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'transparent', color: '#1A1C1E' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: '#3F6DF6',
              color: '#fff',
              fontWeight: 700,
              px: 3.5,
              py: 1,
              borderRadius: '24px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2855DC', boxShadow: 'none' },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEdit ? (
              'Update KPI'
            ) : (
              'Save KPI'
            )}
          </Button>
        </Stack>
      </Box>

      {/* ── Toast ── */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          sx={{ borderRadius: 3, fontWeight: 600, boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateKpiPage;
