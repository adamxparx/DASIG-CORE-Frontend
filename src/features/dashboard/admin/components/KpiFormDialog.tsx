import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { kpiService } from '../../shared/api/kpiService';
import type { DashboardKpiItem } from '../../shared/types/dashboard.types';
import type { Committee, CreateKpiDefinitionRequest, ReportingFrequency, UpdateKpiDefinitionRequest } from '../../shared/types/kpi.types';
import { getDeadlineFieldHelperText } from '../../../notification/utils/notificationDisplay';
import { REPORTING_FREQUENCY_OPTIONS } from '../../../kpisubmission/shared/utils/reportingPeriodUtils';

export interface KpiSubmitSuccessContext {
  deadline: string;
  isEdit: boolean;
  organizationName: string;
}

interface KpiFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (context: KpiSubmitSuccessContext) => void;
  kpi?: DashboardKpiItem | null; // If provided, we are in Edit mode
}

const KpiFormDialog = ({ open, onClose, onSubmitSuccess, kpi }: KpiFormDialogProps) => {
  const isEdit = !!kpi;

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [committeeId, setCommitteeId] = useState<number | ''>('');
  const [reportingFrequency, setReportingFrequency] = useState<ReportingFrequency>('QUARTERLY');

  // UI/API States
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoadingCommittees, setIsLoadingCommittees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateForInput = (rawDate: string) => {
    if (!rawDate) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return rawDate;
    }

    try {
      const dateObj = new Date(rawDate);
      if (!Number.isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  const resetForCreate = () => {
    setName('');
    setDescription('');
    setTargetValue('');
    setUnit('');
    setDeadline('');
    setThreshold('80');
    setCommitteeId('');
    setReportingFrequency('QUARTERLY');
  };

  const populateForEdit = (currentKpi: DashboardKpiItem, comms: Committee[]) => {
    setName(currentKpi.name);
    setDescription(currentKpi.description);
    setTargetValue(String(currentKpi.targetValue));
    setUnit(currentKpi.unit);
    setDeadline(formatDateForInput(currentKpi.deadline));

    const itemWithThreshold = currentKpi as DashboardKpiItem & {
      threshold?: number;
      reportingFrequency?: ReportingFrequency;
    };
    setThreshold(String(itemWithThreshold.threshold ?? 80));
    setReportingFrequency(itemWithThreshold.reportingFrequency ?? 'QUARTERLY');

    if (comms.length > 0) {
      const matchedComm = comms.find(
        (c) => c.name.toLowerCase() === currentKpi.organization.toLowerCase()
      );
      setCommitteeId(matchedComm ? matchedComm.id : '');
    } else {
      setCommitteeId('');
    }
  };

  const initializeForm = (comms: Committee[]) => {
    setErrorMessage(null);
    setErrors({});
    if (kpi) {
      populateForEdit(kpi, comms);
      return;
    }
    resetForCreate();
  };

  // Fetch committees on mount
  useEffect(() => {
    const loadCommittees = async () => {
      setIsLoadingCommittees(true);
      try {
        const data = await kpiService.getCommittees();
        setCommittees(data);
        initializeForm(data);
      } catch {
        setCommittees([]);
        initializeForm([]);
      } finally {
        setIsLoadingCommittees(false);
      }
    };
    if (open) {
      void loadCommittees();
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'KPI Name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!targetValue.trim()) {
      newErrors.targetValue = 'Target Value is required';
    } else if (isNaN(Number(targetValue)) || Number(targetValue) <= 0) {
      newErrors.targetValue = 'Target Value must be a number greater than 0';
    }
    if (!unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(deadline);
      selectedDate.setHours(0, 0, 0, 0);

      const isDeadlineChanged = kpi ? deadline !== formatDateForInput(kpi.deadline) : true;
      if (isDeadlineChanged && selectedDate < today) {
        newErrors.deadline = 'Deadline cannot be a past date';
      }
    }
    if (!threshold.trim()) {
      newErrors.threshold = 'Threshold is required';
    } else {
      const numVal = Number(threshold);
      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        newErrors.threshold = 'Threshold must be a percentage between 0 and 100';
      }
    }
    if (committeeId === '') {
      newErrors.committeeId = 'Assigned Committee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      targetValue: Number(targetValue),
      unit: unit.trim(),
      deadline,
      threshold: Number(threshold),
      committeeId: committeeId as number,
      reportingFrequency,
    };

    try {
      if (isEdit && kpi) {
        await kpiService.updateKpiDefinition(kpi.id, payload as UpdateKpiDefinitionRequest);
      } else {
        await kpiService.createKpiDefinition(payload as CreateKpiDefinitionRequest);
      }
      const commName =
        committees.find((c) => c.id === committeeId)?.name ?? 'the assigned committee';
      onSubmitSuccess({ deadline, isEdit, organizationName: commName });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: {
          onEnter: () => initializeForm(committees),
        },
        paper: {
          sx: {
            borderRadius: 4,
            p: 2,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" sx={{ fontWeight: 700, color: '#1A1C1E', fontSize: '1.45rem' }}>
          {isEdit ? 'Edit KPI' : 'Create New KPI'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2, py: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* KPI Name */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  KPI Name <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Description <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            {/* Target Value & Unit Row */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Target Value <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Unit <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            {/* Deadline & Threshold Row */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Deadline <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                slotProps={{
                  htmlInput: {
                    min: getTodayDateString(),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Threshold (%) <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  },
                }}
              />
            </Grid>

            {/* Reporting Frequency */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Reporting Frequency <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
              <FormControl fullWidth disabled={isSubmitting}>
                <Select
                  value={reportingFrequency}
                  onChange={(e) => setReportingFrequency(e.target.value as ReportingFrequency)}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  }}
                >
                  {REPORTING_FREQUENCY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assigned Committee */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Assigned Committee <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
              <FormControl fullWidth error={!!errors.committeeId} disabled={isSubmitting || isLoadingCommittees}>
                <Select
                  value={committeeId}
                  onChange={(e) => setCommitteeId(e.target.value as number)}
                  displayEmpty
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  }}
                >
                  <MenuItem value="" disabled>
                    {isLoadingCommittees ? 'Loading committees...' : 'Select assigned committee...'}
                  </MenuItem>
                  {committees
                    .filter((c) => {
                      const isActive = !c.status || c.status.toLowerCase() === 'active';
                      const isCurrentlySelected = c.id === committeeId;
                      return isActive || isCurrentlySelected;
                    })
                    .map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                </Select>
                {errors.committeeId ? (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.committeeId}
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: '#5F6368', mt: 0.5, ml: 1.75, display: 'block' }}>
                    This KPI will automatically be assigned to all active organizations under this committee.
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#5F6368',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
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
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: '24px',
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#2855DC',
                boxShadow: 'none',
              },
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
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default KpiFormDialog;
