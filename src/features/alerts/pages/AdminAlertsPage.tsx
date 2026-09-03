import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import TablePaginationBar, { TABLE_PAGE_SIZE } from '../../dashboard/shared/components/TablePaginationBar';
import { alertsService } from '../api/alertsService';
import { formatValue, getAcknowledgmentBadgeInfo, getPerformanceBadgeInfo } from '../components/AlertCard';
import AlertDetailModal from '../components/AlertDetailModal';
import type { AlertDetailResponse } from '../types/alerts.types';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertDetailResponse[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('UNACKNOWLEDGED');
  const [typeFilter, setTypeFilter] = useState('all');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Toast notifications
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadAlerts = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const data = await alertsService.getAllDetailed();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load active alerts.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleCardClick = (alert: AlertDetailResponse) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await alertsService.acknowledge(id);
      showToast('Alert acknowledged successfully.');
      // Refresh list to update state
      await loadAlerts(true);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to acknowledge alert.');
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleCommitteeFilterChange = (event: SelectChangeEvent) => {
    setCommitteeFilter(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Unique committee names for the committee filter dropdown
  const uniqueCommitteeNames = Array.from(
    new Set(alerts.map((a) => a.committeeName).filter((name): name is string => !!name))
  ).sort();

  // Dynamic filtering logic
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = normalizedQuery === '' || alert.kpiName.toLowerCase().includes(normalizedQuery);
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesType = typeFilter === 'all' || alert.alertType === typeFilter;
    const matchesCommittee = committeeFilter === 'all' || alert.committeeName === committeeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCommittee;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAlerts = filteredAlerts.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE);

  const activeAlertCount = alerts.filter((a) => a.status === 'UNACKNOWLEDGED').length;
  const hasActiveFilters =
    normalizedQuery !== '' || statusFilter !== 'UNACKNOWLEDGED' || typeFilter !== 'all' || committeeFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('UNACKNOWLEDGED');
    setTypeFilter('all');
    setCommitteeFilter('all');
    setPage(1);
  };

  if (isLoading) {
    return (
      <AdminPageLayout>
        <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#426ef0' }} />
        </Stack>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Stack spacing={0.25}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
                Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Monitor threshold breaches and performance issues
              </Typography>
            </Stack>
          </Stack>

          {activeAlertCount > 0 && (
            <Box
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: '50px',
                bgcolor: '#FCE8E6',
                color: '#C5221F',
                fontWeight: 700,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              {activeAlertCount === 1 ? '1 active alert' : `${activeAlertCount} active alerts`}
            </Box>
          )}
        </Box>

        {/* Search bar + filters, side by side */}
        {alerts.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              placeholder="Search by KPI…"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              fullWidth
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Committee Dropdown Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, bgcolor: 'background.paper' }}>
              <InputLabel id="committee-filter-label">Filter by Committee</InputLabel>
              <Select
                labelId="committee-filter-label"
                id="committee-filter"
                value={committeeFilter}
                label="Filter by Committee"
                onChange={handleCommitteeFilterChange}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="all">
                  All Committees
                </MenuItem>
                {uniqueCommitteeNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Alert Type Dropdown Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, bgcolor: 'background.paper' }}>
              <InputLabel id="type-filter-label">Filter by Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label="Filter by Type"
                onChange={handleTypeFilterChange}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
                <MenuItem value="AT_RISK">At Risk</MenuItem>
              </Select>
            </FormControl>

            {/* Acknowledgment Status Dropdown Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, bgcolor: 'background.paper' }}>
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="UNACKNOWLEDGED">Unacknowledged</MenuItem>
                <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Typography
                component="button"
                onClick={handleResetFilters}
                sx={{
                  alignSelf: 'center',
                  ml: { sm: 'auto' },
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#426ef0',
                  whiteSpace: 'nowrap',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Reset filters
              </Typography>
            )}
          </Stack>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 4,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <ErrorIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              All Caught Up!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              No performance alerts or threshold breaches have been detected. Your Consortium KPIs are within bounds.
            </Typography>
          </Box>
        ) : filteredAlerts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 4,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              No matching alerts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search, committee, or status filter to find the alert you are looking for.
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      KPI
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      Detected
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      Contribution
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      Achievement
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      Severity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedAlerts.map((alert) => {
                    const perfBadge = getPerformanceBadgeInfo(alert);
                    const ackBadge = getAcknowledgmentBadgeInfo(alert);
                    const formattedDate = new Date(alert.detectedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const isSelected = selectedAlert?.id === alert.id && isModalOpen;

                    return (
                      <TableRow
                        key={alert.id}
                        hover
                        onClick={() => handleCardClick(alert)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'action.hover' : 'transparent',
                          outline: isSelected ? 2 : 'none',
                          outlineColor: 'primary.main',
                          outlineOffset: -2,
                          '& td': {
                            borderBottom: 1,
                            borderColor: 'divider',
                          },
                        }}
                      >
                        <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>{alert.kpiName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formattedDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alert.submissionId ? formatValue(alert.periodContribution, alert.unit) : 'No submissions'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {(alert.achievementRate ?? 0).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1.5,
                              py: 0.35,
                              borderRadius: '50px',
                              bgcolor: perfBadge.bgColor,
                              color: perfBadge.textColor,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {perfBadge.label}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1.5,
                              py: 0.35,
                              borderRadius: '50px',
                              bgcolor: ackBadge.bgColor,
                              color: ackBadge.textColor,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {ackBadge.label}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePaginationBar total={filteredAlerts.length} page={safePage} onPageChange={setPage} />
          </Box>
        )}
      </Stack>

      {/* Alert Details Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcknowledge={handleAcknowledge}
      />

      {/* Success Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ borderRadius: 3, fontWeight: 600, px: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </AdminPageLayout>
  );
}
