import ErrorIcon from '@mui/icons-material/Error';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import { alertsService } from '../api/alertsService';
import AlertCard from '../components/AlertCard';
import AlertDetailModal from '../components/AlertDetailModal';
import type { AlertDetailResponse } from '../types/alerts.types';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertDetailResponse[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [kpiFilter, setKpiFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('UNACKNOWLEDGED');

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

  const handleKpiFilterChange = (event: SelectChangeEvent) => {
    setKpiFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // Get unique KPI names for the KPI filter dropdown
  const uniqueKpiNames = Array.from(new Set(alerts.map((a) => a.kpiName))).sort();

  // Dynamic filtering logic
  const filteredAlerts = alerts.filter((alert) => {
    const matchesKpi = kpiFilter === 'all' || alert.kpiName === kpiFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesKpi && matchesStatus;
  });

  const activeAlertCount = alerts.filter((a) => a.status === 'UNACKNOWLEDGED').length;

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
      <Stack spacing={3.5}>
        {/* Mockup-perfect Premium Alerts Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'text.primary',
                color: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& svg': { fontSize: 26 },
              }}
            >
              <ErrorIcon />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                Alerts
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Monitor threshold breaches and performance issues
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.9rem' }}>
            {activeAlertCount === 1 ? '1 active alert' : `${activeAlertCount} active alerts`}
          </Typography>
        </Box>

        <Divider />

        {/* Filters Panel */}
        {alerts.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              p: 2.5,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            {/* KPI Dropdown Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
              <InputLabel id="kpi-filter-label" sx={{ fontWeight: 500 }}>Filter by KPI</InputLabel>
              <Select
                labelId="kpi-filter-label"
                id="kpi-filter"
                value={kpiFilter}
                label="Filter by KPI"
                onChange={handleKpiFilterChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">
                  All KPIs
                </MenuItem>
                {uniqueKpiNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Acknowledgment Status Dropdown Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel id="status-filter-label" sx={{ fontWeight: 500 }}>Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">
                  All Statuses
                </MenuItem>
                <MenuItem value="UNACKNOWLEDGED">Unacknowledged</MenuItem>
                <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
              Try adjusting your KPI or Status filters to find the alert you are looking for.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClick={() => handleCardClick(alert)}
              />
            ))}
          </Stack>
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
