import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { committeeService } from '../../../committee/api/committeeService';
import type { CommitteeResponse } from '../../../committee/types/committee.types';
import { organizationService } from '../../../organization/api/organizationService';
import type { OrganizationResponse } from '../../../organization/types/organization.types';
import { kpiService } from '../../shared/api/kpiService';
import type { DashboardKpiItem } from '../../shared/types/dashboard.types';
import type { CreateKpiDefinitionRequest, ReportingFrequency, UpdateKpiDefinitionRequest } from '../../shared/types/kpi.types';
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
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
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

  const populateForEdit = (currentKpi: DashboardKpiItem, comms: CommitteeResponse[]) => {
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
        (c) =>
          c.name.toLowerCase() === currentKpi.organization.toLowerCase() ||
          c.name.toLowerCase() === (currentKpi as typeof currentKpi & { committeeName?: string }).committeeName?.toLowerCase()
      );
      setCommitteeId(matchedComm ? matchedComm.id : '');
    } else {
      setCommitteeId('');
    }
  };

  const initializeForm = (comms: CommitteeResponse[]) => {
    setErrorMessage(null);
    setErrors({});
    if (kpi) {
      populateForEdit(kpi, comms);
      return;
    }
    resetForCreate();
  };

  // Fetch committees and organizations on open
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [commData, orgData] = await Promise.all([
          committeeService.getAll().catch(() => [] as CommitteeResponse[]),
          organizationService.getAll().catch(() => [] as OrganizationResponse[]),
        ]);
        setCommittees(commData);
        setOrganizations(orgData);
        initializeForm(commData);
      } catch {
        setCommittees([]);
        setOrganizations([]);
        initializeForm([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    if (open) {
      void loadData();
    }
  }, [open]);

  const getOrganizationsForCommittee = useCallback(
    (commId: number): OrganizationResponse[] => {
      const comm = committees.find((c) => c.id === commId);
      if (!comm) return [];
      return organizations.filter((org) => {
        const inOrgIds = Array.isArray(comm.organizationIds) && comm.organizationIds.includes(org.id);
        const isCommIdMatch = org.committeeId === comm.id;
        return inOrgIds || isCommIdMatch;
      });
    },
    [committees, organizations]
  );

  const selectedCommittee = useMemo(() => {
    if (committeeId === '') return null;
    return committees.find((c) => c.id === committeeId) ?? null;
  }, [committees, committeeId]);

  const selectedCommitteeOrganizations = useMemo(() => {
    if (!selectedCommittee) return [];
    return getOrganizationsForCommittee(selectedCommittee.id);
  }, [selectedCommittee, getOrganizationsForCommittee]);

  const activeCommittees = useMemo(() => {
    return committees.filter((c) => {
      const isActive = !c.status || c.status.toLowerCase() === 'active';
      const isCurrentlySelected = c.id === committeeId;
      return isActive || isCurrentlySelected;
    });
  }, [committees, committeeId]);

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
      newErrors.committeeId = 'Please select a committee to assign this KPI.';
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
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            p: { xs: 1.5, sm: 2.5 },
            boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" sx={{ fontWeight: 800, color: '#1A1C1E', fontSize: '1.45rem' }}>
          {isEdit ? 'Edit KPI' : 'Create New KPI'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2, pt: 1, maxHeight: '75vh', overflowY: 'auto' }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* KPI Name */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                KPI Name <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g., Number of Startups Incubated"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
                hiddenLabel
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Description <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Describe the KPI and its purpose..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                error={!!errors.description}
                helperText={errors.description}
                disabled={isSubmitting}
                hiddenLabel
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            {/* Target Value & Unit Row */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Target Value <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="100"
                value={targetValue}
                onChange={(e) => {
                  setTargetValue(e.target.value);
                  if (errors.targetValue) setErrors((prev) => ({ ...prev, targetValue: '' }));
                }}
                error={!!errors.targetValue}
                helperText={errors.targetValue}
                disabled={isSubmitting}
                hiddenLabel
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Unit <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="startups, sessions, etc."
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }));
                }}
                error={!!errors.unit}
                helperText={errors.unit}
                disabled={isSubmitting}
                hiddenLabel
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            {/* Deadline & Threshold Row */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Deadline <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="date"
                variant="outlined"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: '' }));
                }}
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
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Threshold (%) <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="80"
                value={threshold}
                onChange={(e) => {
                  setThreshold(e.target.value);
                  if (errors.threshold) setErrors((prev) => ({ ...prev, threshold: '' }));
                }}
                error={!!errors.threshold}
                helperText={errors.threshold}
                disabled={isSubmitting}
                hiddenLabel
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
                  },
                }}
              />
            </Grid>

            {/* Reporting Frequency */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3C4043', mb: 1 }}>
                Reporting Frequency <span style={{ color: '#D93025' }}>*</span>
              </Typography>
              <FormControl fullWidth disabled={isSubmitting}>
                <Select
                  value={reportingFrequency}
                  onChange={(e) => setReportingFrequency(e.target.value as ReportingFrequency)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#FAFBFF',
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

            {/* Dedicated Assignment Container */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  mt: 1,
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: errors.committeeId ? 'error.main' : '#E2E8F0',
                  bgcolor: '#FBFDFF',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1C1E', mb: 0.5 }}>
                  Committee & Organization Assignment
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
                  Assign the committee responsible for this KPI. All active member organizations under the chosen committee will be linked automatically.
                </Typography>

                {!isEdit && (
                  <Box sx={{ mb: 2 }}>
                    <Autocomplete
                      disabled={isSubmitting || isLoadingData}
                      options={activeCommittees}
                      value={selectedCommittee}
                      onChange={(_, newValue) => {
                        setCommitteeId(newValue ? newValue.id : '');
                        if (errors.committeeId) setErrors((prev) => ({ ...prev, committeeId: '' }));
                      }}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      loading={isLoadingData}
                      noOptionsText={isLoadingData ? 'Loading committees...' : 'No matching committees found'}
                      renderOption={(props, option) => {
                        const orgs = getOrganizationsForCommittee(option.id);
                        const activeOrgs = orgs.filter((o) => !o.status || o.status.toLowerCase() === 'active');
                        const { key, ...otherProps } = props;

                        return (
                          <Box
                            key={key}
                            component="li"
                            {...otherProps}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              py: 1.25,
                              px: 2,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.25 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1C1E' }}>
                                {option.name}
                              </Typography>
                              <Chip
                                size="small"
                                label={`${activeOrgs.length} Orgs`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: activeOrgs.length > 0 ? '#E8F0FE' : '#F1F3F4',
                                  color: activeOrgs.length > 0 ? '#1A73E8' : '#5F6368',
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#5F6368', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ApartmentOutlinedIcon sx={{ fontSize: 13 }} />
                              {activeOrgs.length > 0
                                ? activeOrgs.map((o) => o.name).join(', ')
                                : 'No organizations assigned yet'}
                            </Typography>
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select assigned committee..."
                          error={!!errors.committeeId}
                          helperText={errors.committeeId}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#FFFFFF',
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                )}

                {/* Selected Committee Breakdown Card */}
                {selectedCommittee ? (
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#FFFFFF',
                      borderColor: '#D0E1FD',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupsOutlinedIcon sx={{ color: '#1A73E8', fontSize: 20 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1C1E' }}>
                            {selectedCommittee.name}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          icon={<CheckCircleOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                          label={selectedCommittee.status || 'Active'}
                          color={!selectedCommittee.status || selectedCommittee.status.toLowerCase() === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 600, height: 22, fontSize: '0.72rem' }}
                        />
                      </Box>

                      <Divider sx={{ my: 1, borderColor: '#EDF2F7' }} />

                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#3C4043', display: 'block', mb: 1 }}>
                        Participating Organizations ({selectedCommitteeOrganizations.length}):
                      </Typography>

                      {selectedCommitteeOrganizations.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          No member organizations assigned yet to this committee.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {selectedCommitteeOrganizations.map((org) => (
                            <Chip
                              key={org.id}
                              icon={<BusinessOutlinedIcon sx={{ fontSize: '14px !important', color: '#3F6DF6' }} />}
                              label={org.name}
                              size="small"
                              variant="outlined"
                              sx={{
                                bgcolor: '#FAFCFF',
                                borderColor: '#D0E1FD',
                                borderRadius: '6px',
                                fontWeight: 500,
                                fontSize: '0.78rem',
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Please select a committee to view member organizations.
                    </Typography>
                  </Box>
                )}

                {errors.committeeId && !selectedCommittee && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {errors.committeeId}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
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
              px: 3.5,
              py: 0.9,
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
