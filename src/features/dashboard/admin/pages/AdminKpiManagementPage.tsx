import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../../lib/api/client';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
import DeleteKpiDialog from '../../admin/components/DeleteKpiDialog';
import AdminKpiSummaryCards from '../../admin/components/AdminKpiSummaryCards';
import { dashboardService } from '../../shared/api/dashboardService';
import type { DashboardApiResponse, DashboardKpiItem } from '../../shared/types/dashboard.types';
import DashboardHeader from '../../shared/components/DashboardHeader';
import DashboardLayout from '../../shared/components/DashboardLayout';
import KpisList from '../../shared/components/KpisList';
import { routes } from '../../../../routes';

const AdminKpiManagementPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKpiForDelete] = useState<DashboardKpiItem | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await dashboardService.getDashboard();
      setDashboardData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load dashboard data.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleCreateClick = () => {
    navigate(routes.adminCreateKpi);
  };

  const handleSelectKpi = (kpi: DashboardKpiItem) => {
    navigate(`/dashboard/admin/kpis/${kpi.id}`);
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleDeleteSuccess = () => {
    void loadDashboard(true);
    showToast('KPI deleted successfully.', 'success');
  };

  const filteredKpis = useMemo(() => {
    const kpis = dashboardData?.kpis ?? [];

    return kpis.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [dashboardData, search]);

  if (isLoading) {
    return (
      <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Stack>
    );
  }

  return (
    <>
      <DashboardLayout
        header={
          <DashboardHeader
            title="KPI Management Hub"
            subtitle="Monitor consortium-wide KPI definitions and performance updates."
          />
        }
        welcomeBanner={
          <AdminKpiSummaryCards kpis={dashboardData?.kpis ?? []} />
        }
        topActions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', mt: 1 }}>
            <TextField
              label="Search KPI"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              sx={{ minWidth: 280 }}
            />
            <CreateKpiButton onClick={handleCreateClick} />
          </Stack>
        }
        filterBar={null}
        content={
          <KpisList
            kpis={filteredKpis}
            selectedId={null}
            onSelectKpi={handleSelectKpi}
          />
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteKpiDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSubmitSuccess={handleDeleteSuccess}
        kpiId={selectedKpiForDelete?.id ?? null}
        kpiName={selectedKpiForDelete?.name ?? ''}
      />

      {/* Snackbar Feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminKpiManagementPage;
