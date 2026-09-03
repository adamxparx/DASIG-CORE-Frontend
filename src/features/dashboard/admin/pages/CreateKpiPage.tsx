import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { committeeService } from '../../../committee/api/committeeService';
import type { CommitteeResponse } from '../../../committee/types/committee.types';
import { organizationService } from '../../../organization/api/organizationService';
import type { OrganizationResponse } from '../../../organization/types/organization.types';
import { kpiService } from '../../shared/api/kpiService';
import type {
  CreateKpiDefinitionRequest,
  UpdateKpiDefinitionRequest,
} from '../../shared/types/kpi.types';
import { getDeadlineFieldHelperText } from '../../../notification/utils/notificationDisplay';
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
  const [committeeId, setCommitteeId] = useState<number | ''>('');

  /* ── UI / API state ─────────────────────── */
  const [committees, setCommittees] = useState<CommitteeResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
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

  /* ── Load committees and organizations ───── */
  const loadCommitteesAndOrgs = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [committeeData, orgData] = await Promise.all([
        committeeService.getAll().catch(() => [] as CommitteeResponse[]),
        organizationService.getAll().catch(() => [] as OrganizationResponse[]),
      ]);
      setCommittees(committeeData);
      setOrganizations(orgData);
      return { committees: committeeData, organizations: orgData };
    } catch {
      setCommittees([]);
      setOrganizations([]);
      return { committees: [], organizations: [] };
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  /* ── Load existing KPI for edit ─────────── */
  const loadKpiForEdit = useCallback(
    async (loadedCommittees: CommitteeResponse[]) => {
      if (!id) return;
      setIsLoadingKpi(true);
      try {
        const kpi = await kpiService.getKpiDefinitionById(Number(id));
        setName(kpi.name);
        setDescription(kpi.description);
        setTargetValue(String(kpi.targetValue));
        setUnit(kpi.unit);
        setDeadline(formatDateForInput(kpi.deadline));
        // threshold and reportingFrequency are set as silent defaults in the payload

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
      const data = await loadCommitteesAndOrgs();
      if (isEdit) {
        await loadKpiForEdit(data.committees);
      }
    };
    void init();
  }, [loadCommitteesAndOrgs, loadKpiForEdit, isEdit]);

  /* ── Organizations mapping helper ─────────── */
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
      const isCurrent = c.id === committeeId;
      return isActive || isCurrent;
    });
  }, [committees, committeeId]);

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
      // Silent defaults — not exposed in the UI
      threshold: 100,
      reportingFrequency: 'ONE_TIME' as const,
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
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
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
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
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
              onChange={(e) => {
                setTargetValue(e.target.value);
                if (errors.targetValue) setErrors((prev) => ({ ...prev, targetValue: '' }));
              }}
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
              onChange={(e) => {
                setUnit(e.target.value);
                if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }));
              }}
              error={!!errors.unit}
              helperText={errors.unit}
              disabled={isSubmitting}
              hiddenLabel
              sx={inputSx}
            />
          </Grid>

          {/* Deadline */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Deadline</FieldLabel>
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
              slotProps={{ htmlInput: { min: getTodayDateString() } }}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        {/* ─────────────────────────────────────────────
            Assignment Container (Below other fields)
        ───────────────────────────────────────────── */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#1A1C1E', fontSize: '1.1rem', mb: 0.5 }}
          >
            Committee & Organization Assignment
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            {isEdit
              ? 'View the committee and the member organizations assigned to this KPI.'
              : 'Select the committee to assign this KPI. All active organizations part of the selected committee will be assigned.'}
          </Typography>

          {!isEdit ? (
            <Box sx={{ mb: 2 }}>
              <FieldLabel>Assigned Committee</FieldLabel>
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
                noOptionsText={isLoadingData ? 'Loading committees...' : 'No committees found'}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1C1E' }}>
                          {option.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={
                            activeOrgs.length === 1
                              ? '1 Organization'
                              : `${activeOrgs.length} Organizations`
                          }
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: activeOrgs.length > 0 ? '#E8F0FE' : '#F1F3F4',
                            color: activeOrgs.length > 0 ? '#1A73E8' : '#5F6368',
                            borderRadius: '12px',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: activeOrgs.length > 0 ? '#5F6368' : '#9AA0A6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <ApartmentOutlinedIcon sx={{ fontSize: 14 }} />
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
                    placeholder="Search and select a committee..."
                    error={!!errors.committeeId}
                    helperText={errors.committeeId}
                    sx={inputSx}
                  />
                )}
              />
            </Box>
          ) : null}

          {/* Selected Committee & Organizations Preview */}
          {selectedCommittee ? (
            <Card
              variant="outlined"
              sx={{
                mt: 2,
                borderRadius: 2,
                bgcolor: '#FAFBFF',
                borderColor: '#E2E8F0',
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1C1E' }}>
                      {selectedCommittee.name}
                    </Typography>
                    {selectedCommittee.description && (
                      <Typography variant="caption" sx={{ color: '#5F6368', display: 'block' }}>
                        {selectedCommittee.description}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      icon={<CheckCircleOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                      label={selectedCommittee.status || 'Active'}
                      color={
                        !selectedCommittee.status || selectedCommittee.status.toLowerCase() === 'active'
                          ? 'success'
                          : 'default'
                      }
                      sx={{ fontWeight: 600, height: 24, fontSize: '0.75rem' }}
                    />
                    {isEdit && (
                      <Chip
                        size="small"
                        label="Cannot be changed"
                        sx={{ bgcolor: '#F1F3F4', color: '#5F6368', fontWeight: 600, height: 24, fontSize: '0.75rem' }}
                      />
                    )}
                  </Stack>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#3C4043',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Organizations part of this committee ({selectedCommitteeOrganizations.length})
                </Typography>

                {selectedCommitteeOrganizations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                    No member organizations assigned yet to this committee.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCommitteeOrganizations.map((org) => {
                      const isActive = !org.status || org.status.toLowerCase() === 'active';
                      return (
                        <Chip
                          key={org.id}
                          icon={<BusinessOutlinedIcon sx={{ fontSize: '15px !important', color: '#3F6DF6' }} />}
                          label={
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                              <span>{org.name}</span>
                              {!isActive && (
                                <span style={{ fontSize: '0.7rem', color: '#D93025' }}>(Inactive)</span>
                              )}
                            </Box>
                          }
                          variant="outlined"
                          sx={{
                            bgcolor: '#FFFFFF',
                            borderColor: '#D0E1FD',
                            borderRadius: '8px',
                            fontWeight: 500,
                            color: '#1A1C1E',
                            fontSize: '0.84rem',
                          }}
                        />
                      );
                    })}
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: '#1A73E8' }} />
                  <Typography variant="caption" sx={{ color: '#5F6368' }}>
                    This KPI will automatically be assigned to all active organizations listed above.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : !isEdit ? (
            <Box
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: '#FAFBFF',
                borderRadius: 2,
                border: '1px dashed #CBD5E1',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Select a committee above to view the organizations part of it.
              </Typography>
            </Box>
          ) : null}

          {errors.committeeId && !selectedCommittee && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errors.committeeId}
            </FormHelperText>
          )}
        </Box>

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
