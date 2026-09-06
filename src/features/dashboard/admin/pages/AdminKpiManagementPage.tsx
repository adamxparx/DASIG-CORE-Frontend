import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../../lib/api/client';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
import DeleteKpiDialog from '../../admin/components/DeleteKpiDialog';
import ArchiveKpiDialog from '../../admin/components/ArchiveKpiDialog';
import UnarchiveKpiDialog from '../../admin/components/UnarchiveKpiDialog';
import AdminKpiSummaryCards from '../../admin/components/AdminKpiSummaryCards';
import { dashboardService } from '../../shared/api/dashboardService';
import type { DashboardApiResponse, DashboardKpiItem, DashboardStatus } from '../../shared/types/dashboard.types';
import DashboardHeader from '../../shared/components/DashboardHeader';
import DashboardLayout from '../../shared/components/DashboardLayout';
import KpiFilterBar from '../../shared/components/KpiFilterBar';
import KpisList from '../../shared/components/KpisList';
import { computeKpiStatus } from '../../shared/utils/kpiStatusUtils';
import { routes } from '../../../../routes';

const AdminKpiManagementPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | 'ALL'>('ALL');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKpiForDelete, setSelectedKpiForDelete] = useState<DashboardKpiItem | null>(null);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedKpiForArchive, setSelectedKpiForArchive] = useState<DashboardKpiItem | null>(null);

  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [selectedKpiForUnarchive, setSelectedKpiForUnarchive] = useState<DashboardKpiItem | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [toastAction, setToastAction] = useState<{ label: string; onClick: () => void } | null>(null);

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

  const showToast = (
    message: string,
    severity: 'success' | 'error',
    action?: { label: string; onClick: () => void }
  ) => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastAction(action ?? null);
    setToastOpen(true);
  };

  const handleDeleteSuccess = () => {
    void loadDashboard(true);
    showToast('KPI deleted successfully.', 'success');
    setDeleteDialogOpen(false);
  };

  const handleEditKpi = (kpi: DashboardKpiItem) => {
    navigate(`/dashboard/admin/kpis/${kpi.id}/edit`, { state: { kpi } });
  };

  const handleDeleteKpi = (kpi: DashboardKpiItem) => {
    setSelectedKpiForDelete(kpi);
    setDeleteDialogOpen(true);
  };

  const handleArchiveKpi = (kpi: DashboardKpiItem) => {
    setSelectedKpiForArchive(kpi);
    setArchiveDialogOpen(true);
  };

  const handleArchiveSuccess = () => {
    void loadDashboard(true);
    showToast('KPI archived successfully.', 'success', {
      label: 'View Archived',
      onClick: () => {
        setStatusTab('ARCHIVED');
        setToastOpen(false);
      },
    });
    setArchiveDialogOpen(false);
  };

  const handleUnarchiveKpi = (kpi: DashboardKpiItem) => {
    setSelectedKpiForUnarchive(kpi);
    setUnarchiveDialogOpen(true);
  };

  const handleUnarchiveSuccess = () => {
    void loadDashboard(true);
    showToast('KPI restored to active status.', 'success', {
      label: 'View Active',
      onClick: () => {
        setStatusTab('ACTIVE');
        setToastOpen(false);
      },
    });
    setUnarchiveDialogOpen(false);
  };

  const { activeKpis, archivedKpis } = useMemo(() => {
    const kpis = dashboardData?.kpis ?? [];
    const active: DashboardKpiItem[] = [];
    const archived: DashboardKpiItem[] = [];

    kpis.forEach((item) => {
      const isArchived = Boolean(item.archived || item.kpiStatus === 'ARCHIVED');
      if (isArchived) {
        archived.push(item);
      } else {
        active.push(item);
      }
    });

    return { activeKpis: active, archivedKpis: archived };
  }, [dashboardData]);

  const organizations = useMemo(() => {
    const kpis = dashboardData?.kpis ?? [];
    const orgs = new Set<string>();
    kpis.forEach((item) => {
      if (item.organization && item.organization.trim()) {
        orgs.add(item.organization.trim());
      }
    });
    return Array.from(orgs).sort((a, b) => a.localeCompare(b));
  }, [dashboardData]);

  const baseKpis = statusTab === 'ACTIVE' ? activeKpis : archivedKpis;

  const displayedKpis = useMemo(() => {
    return baseKpis.filter((item) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = (item.description ?? '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }

      if (committeeFilter !== 'ALL' && item.organization !== committeeFilter) {
        return false;
      }

      if (statusFilter !== 'ALL') {
        const overallTarget = item.overallTargetValue ?? item.targetValue;
        const computedStatus = computeKpiStatus(item.submittedValue, overallTarget, item.deadline);
        if (computedStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [baseKpis, search, committeeFilter, statusFilter]);

  const hasActiveFilters = Boolean(
    search.trim() || committeeFilter !== 'ALL' || statusFilter !== 'ALL'
  );

  const handleResetFilters = () => {
    setSearch('');
    setCommitteeFilter('ALL');
    setStatusFilter('ALL');
  };

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
          <AdminKpiSummaryCards kpis={activeKpis} />
        }
        topActions={
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
              }}
            >
              <Tabs
                value={statusTab}
                onChange={(_, val: 'ACTIVE' | 'ARCHIVED') => setStatusTab(val)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 48 }}
              >
                <Tab
                  label={`Active KPIs (${activeKpis.length})`}
                  value="ACTIVE"
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', minHeight: 48 }}
                />
                <Tab
                  label={`Archived KPIs (${archivedKpis.length})`}
                  value="ARCHIVED"
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', minHeight: 48 }}
                />
              </Tabs>
              {statusTab === 'ACTIVE' && (
                <Box sx={{ pb: { xs: 1.5, sm: 0 } }}>
                  <CreateKpiButton onClick={handleCreateClick} />
                </Box>
              )}
            </Stack>
          </Box>
        }
        filterBar={
          <KpiFilterBar
            search={search}
            status={statusFilter}
            organization={committeeFilter}
            organizations={organizations}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onOrganizationChange={setCommitteeFilter}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        }
        content={
          <KpisList
            kpis={displayedKpis}
            selectedId={null}
            onSelectKpi={handleSelectKpi}
            onEditKpi={statusTab === 'ACTIVE' ? handleEditKpi : undefined}
            onDeleteKpi={handleDeleteKpi}
            onArchiveKpi={statusTab === 'ACTIVE' ? handleArchiveKpi : undefined}
            onUnarchiveKpi={statusTab === 'ARCHIVED' ? handleUnarchiveKpi : undefined}
            title={null}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        }
      />

      {/* Archive Confirmation Modal */}
      <ArchiveKpiDialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onSubmitSuccess={handleArchiveSuccess}
        kpiId={selectedKpiForArchive?.id ?? null}
        kpiName={selectedKpiForArchive?.name ?? ''}
      />

      {/* Restore / Unarchive Confirmation Modal */}
      <UnarchiveKpiDialog
        open={unarchiveDialogOpen}
        onClose={() => setUnarchiveDialogOpen(false)}
        onSubmitSuccess={handleUnarchiveSuccess}
        kpiId={selectedKpiForUnarchive?.id ?? null}
        kpiName={selectedKpiForUnarchive?.name ?? ''}
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
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastOpen(false)}
          action={
            toastAction ? (
              <Button
                color="inherit"
                size="small"
                onClick={toastAction.onClick}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: 'currentColor',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.25,
                  ml: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {toastAction.label}
              </Button>
            ) : undefined
          }
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
