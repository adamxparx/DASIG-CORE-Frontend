import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { ApiError } from '../../../../lib/api/client';
import DashboardViewToggle from '../../admin/components/DashboardViewToggle';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
import KpiFormDialog from '../../admin/components/KpiFormDialog';
import DeleteKpiDialog from '../../admin/components/DeleteKpiDialog';
import { dashboardService } from '../api/dashboardService';
import type { DashboardApiResponse, DashboardKpiItem, DashboardStatus, DashboardViewMode, UserRole } from '../types/dashboard.types';
import DashboardHeader from './DashboardHeader';
import DashboardLayout from './DashboardLayout';
import KpiDashboardCard from './KpiDashboardCard';
import KpiFilterBar from './KpiFilterBar';
import KpiGrid from './KpiGrid';
import WelcomeBanner from './WelcomeBanner';

interface RoleBasedDashboardPageProps {
  role: UserRole;
  title: string;
  subtitle: string;
  welcomeMessage: string;
}

const RoleBasedDashboardPage = ({
  role,
  title,
  subtitle,
  welcomeMessage,
}: RoleBasedDashboardPageProps) => {
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DashboardStatus | 'ALL'>('ALL');
  const [organization, setOrganization] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<DashboardViewMode>('grid');

  // Form Dialog States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedKpiForEdit, setSelectedKpiForEdit] = useState<DashboardKpiItem | null>(null);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKpiForDelete, setSelectedKpiForDelete] = useState<DashboardKpiItem | null>(null);

  // Toast notification state
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
      if (response.organizationName && role !== 'DASIG_ADMIN') {
        setOrganization(response.organizationName);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load dashboard data.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [role]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleCreateClick = () => {
    setSelectedKpiForEdit(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (item: DashboardKpiItem) => {
    setSelectedKpiForEdit(item);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (item: DashboardKpiItem) => {
    setSelectedKpiForDelete(item);
    setDeleteDialogOpen(true);
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCreateOrUpdateSuccess = () => {
    void loadDashboard(true);
    showToast(selectedKpiForEdit ? 'KPI updated successfully.' : 'KPI created successfully.', 'success');
  };

  const handleDeleteSuccess = () => {
    void loadDashboard(true);
    showToast('KPI deleted successfully.', 'success');
  };

  const organizations = useMemo(() => {
    const kpis = dashboardData?.kpis ?? [];
    const uniqueOrgs = [...new Set(kpis.map((item) => item.organization))];
    return ['ALL', ...uniqueOrgs];
  }, [dashboardData]);

  const filteredKpis = useMemo(() => {
    const kpis = dashboardData?.kpis ?? [];

    return kpis.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (organization !== 'ALL' && item.organization !== organization) {
        return false;
      }

      if (status !== 'ALL' && item.status !== status) {
        return false;
      }
      return true;
    });
  }, [dashboardData, organization, search, status]);

  const topActions =
    role === 'DASIG_ADMIN' ? (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
        <CreateKpiButton onClick={handleCreateClick} />
        <DashboardViewToggle viewMode={viewMode} onChange={setViewMode} />
      </Stack>
    ) : null;

  const resolvedTitle =
    role === 'DASIG_ADMIN'
      ? title
      : `${dashboardData?.organizationName ?? 'Organization'} KPI Dashboard`;

  const resolvedWelcomeMessage =
    role === 'DASIG_ADMIN'
      ? welcomeMessage
      : `Welcome, ${dashboardData?.organizationName ?? (role === 'STAFF' ? 'Staff' : 'TBI Manager')}`;

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
        role={role}
        header={<DashboardHeader title={resolvedTitle} subtitle={subtitle} />}
        welcomeBanner={<WelcomeBanner message={resolvedWelcomeMessage} />}
        topActions={topActions}
        filterBar={
          <KpiFilterBar
            search={search}
            status={status}
            organization={organization}
            organizations={organizations}
            organizationLocked={role !== 'DASIG_ADMIN'}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onOrganizationChange={setOrganization}
          />
        }
        content={
          <KpiGrid
            title={role === 'DASIG_ADMIN' ? 'All KPIs' : 'Organization KPIs'}
            items={filteredKpis}
            viewMode={viewMode}
            gridColumns={3}
            renderItem={(item) => (
              <KpiDashboardCard
                key={item.id}
                item={item}
                role={role}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            )}
          />
        }
      />

      {/* KPI Form Modal */}
      <KpiFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmitSuccess={handleCreateOrUpdateSuccess}
        kpi={selectedKpiForEdit}
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

export default RoleBasedDashboardPage;
