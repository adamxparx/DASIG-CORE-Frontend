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
import type { CreateKpiDefinitionRequest, Organization, UpdateKpiDefinitionRequest } from '../../shared/types/kpi.types';

interface KpiFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  kpi?: DashboardKpiItem | null; // If provided, we are in Edit mode
}

const KpiFormDialog = ({ open, onClose, onSubmitSuccess, kpi }: KpiFormDialogProps) => {
  const isEdit = !!kpi;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [organizationId, setOrganizationId] = useState<number | ''>('');

  // UI/API States
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch organizations on mount
  useEffect(() => {
    const loadOrgs = async () => {
      setIsLoadingOrgs(true);
      try {
        const data = await kpiService.getOrganizations();
        setOrganizations(data);
      } catch {
        // Fallback is handled in kpiService, but we set an empty array just in case
        setOrganizations([]);
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    if (open) {
      void loadOrgs();
    }
  }, [open]);

  // Reset/Populate form fields when dialog opens or changes
  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setErrors({});
      if (kpi) {
        setName(kpi.name);
        setDescription(kpi.description);
        setTargetValue(String(kpi.targetValue));
        setUnit(kpi.unit);

        // Format date string from backend/dashboard (e.g. '2026-06-30') to YYYY-MM-DD
        let formattedDate = '';
        if (kpi.deadline) {
          try {
            const dateObj = new Date(kpi.deadline);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            } else {
              formattedDate = kpi.deadline;
            }
          } catch {
            formattedDate = kpi.deadline;
          }
        }
        setDeadline(formattedDate);

        // Try to match threshold from state or default to 80
        // (Note: in DashboardKpiItem, threshold might not exist. If it does not, default to 80)
        const itemWithThreshold = kpi as DashboardKpiItem & { threshold?: number };
        setThreshold(String(itemWithThreshold.threshold ?? 80));

        // Find matching organization by name to set the initial organizationId
        if (organizations.length > 0) {
          const matchedOrg = organizations.find(
            (org) => org.name.toLowerCase() === kpi.organization.toLowerCase()
          );
          if (matchedOrg) {
            setOrganizationId(matchedOrg.id);
          }
        }
      } else {
        setName('');
        setDescription('');
        setTargetValue('');
        setUnit('');
        setDeadline('');
        setThreshold('80');
        setOrganizationId('');
      }
    }
  }, [open, kpi, organizations]);

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
    }
    if (!threshold.trim()) {
      newErrors.threshold = 'Threshold is required';
    } else {
      const numVal = Number(threshold);
      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        newErrors.threshold = 'Threshold must be a percentage between 0 and 100';
      }
    }
    if (organizationId === '') {
      newErrors.organizationId = 'Assigned Organization is required';
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
      organizationId: organizationId as number,
    };

    try {
      if (isEdit && kpi) {
        await kpiService.updateKpiDefinition(kpi.id, payload as UpdateKpiDefinitionRequest);
      } else {
        await kpiService.createKpiDefinition(payload as CreateKpiDefinitionRequest);
      }
      onSubmitSuccess();
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
                helperText={errors.deadline}
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

            {/* Assigned Organization */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                  Assigned Organization <span style={{ color: '#D93025' }}>*</span>
                </Typography>
              </Box>
              <FormControl fullWidth error={!!errors.organizationId} disabled={isSubmitting || isLoadingOrgs}>
                <Select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value as number)}
                  displayEmpty
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#FBFBFD',
                  }}
                >
                  <MenuItem value="" disabled>
                    {isLoadingOrgs ? 'Loading organizations...' : 'Select assigned organization...'}
                  </MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.organizationId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.organizationId}
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
