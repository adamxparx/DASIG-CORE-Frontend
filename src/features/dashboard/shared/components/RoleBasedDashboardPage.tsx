import Alert from '@mui/material/Alert';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../../lib/api/client';
import DashboardViewToggle from '../../admin/components/DashboardViewToggle';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
import KpiFormDialog from '../../admin/components/KpiFormDialog';
import DeleteKpiDialog from '../../admin/components/DeleteKpiDialog';
import AdminKpiSummaryCards from '../../admin/components/AdminKpiSummaryCards';
import { dashboardService } from '../api/dashboardService';
import type { DashboardApiResponse, DashboardKpiItem, DashboardStatus, DashboardViewMode, UserRole } from '../types/dashboard.types';
import DashboardHeader from './DashboardHeader';
import DashboardLayout from './DashboardLayout';
import CommitteeSelector from './CommitteeSelector';
import CommitteeCardsGrid from './CommitteeCardsGrid';
import { useDashboardShell } from './DashboardShellContext';
import KpiDashboardCard from './KpiDashboardCard';
import KpiFilterBar from './KpiFilterBar';
import KpiGrid from './KpiGrid';
import KpisList from './KpisList';
import KpiPeriodHistoryDrawer from './KpiPeriodHistoryDrawer';
import { getDeadlineAlertLeadDays } from '../../../notification/utils/notificationDisplay';
import type { KpiSubmitSuccessContext } from '../../admin/components/KpiFormDialog';

interface RoleBasedDashboardPageProps {
  role: UserRole;
  title: string;
  subtitle: string;
}

const RoleBasedDashboardPage = ({
  role,
  title,
  subtitle,
}: RoleBasedDashboardPageProps) => {
  const navigate = useNavigate();
  const { setCommitteeSelector } = useDashboardShell();
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DashboardStatus | 'ALL'>('ALL');
  const [organization, setOrganization] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<DashboardViewMode>('grid');
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(null);

  // Form Dialog States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedKpiForEdit, setSelectedKpiForEdit] = useState<DashboardKpiItem | null>(null);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKpiForDelete, setSelectedKpiForDelete] = useState<DashboardKpiItem | null>(null);

  // Period history drawer
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedKpiForHistory, setSelectedKpiForHistory] = useState<DashboardKpiItem | null>(null);

  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await dashboardService.getDashboard(selectedCommitteeId ?? undefined);
      setDashboardData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load dashboard data.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [selectedCommitteeId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleCommitteeChange = (id: number | null) => {
    setSelectedCommitteeId(id);
  };

  useEffect(() => {
    if (
      role === 'TBI_MANAGER' &&
      selectedCommitteeId !== null &&
      dashboardData?.committees &&
      !dashboardData.committees.some((c) => c.id === selectedCommitteeId)
    ) {
      setSelectedCommitteeId(null);
    }
  }, [role, selectedCommitteeId, dashboardData?.committees]);

  useEffect(() => {
    if (role === 'TBI_MANAGER' && dashboardData) {
      setCommitteeSelector(
        <CommitteeSelector
          committees={dashboardData.committees ?? []}
          selectedId={selectedCommitteeId}
          onCommitteeChange={handleCommitteeChange}
        />
      );
    } else {
      setCommitteeSelector(null);
    }
  }, [role, dashboardData, selectedCommitteeId, setCommitteeSelector]);

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

  const handleViewHistoryClick = (item: DashboardKpiItem) => {
    setSelectedKpiForHistory(item);
    setHistoryDrawerOpen(true);
  };

  const handleSelectKpi = (item: DashboardKpiItem) => {
    if (role === 'STAFF') {
      navigate(`/dashboard/staff/kpis/${item.id}`);
    } else if (role === 'TBI_MANAGER') {
      navigate(`/dashboard/tbi_manager/kpis/${item.id}`);
    } else {
      navigate(`/dashboard/admin/kpis/${item.id}`);
    }
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCreateOrUpdateSuccess = ({
    deadline,
    isEdit,
    organizationName,
  }: KpiSubmitSuccessContext) => {
    void loadDashboard(true);

    const baseMessage = isEdit ? 'KPI updated successfully.' : 'KPI created successfully.';
    const leadDays = getDeadlineAlertLeadDays(deadline);
    const alertMessage =
      leadDays === 7
        ? `${baseMessage} 7-day deadline alert sent to ${organizationName}.`
        : leadDays === 2
          ? `${baseMessage} 2-day deadline alert sent to ${organizationName}.`
          : baseMessage;

    showToast(alertMessage, 'success');
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
      if (role === 'TBI_MANAGER') {
        const assignedCommittees = dashboardData?.committees ?? [];
        if (assignedCommittees.length === 0) {
          return false;
        }

        if (selectedCommitteeId !== null) {
          const isAssigned = assignedCommittees.some((c) => c.id === selectedCommitteeId);
          if (!isAssigned) {
            return false;
          }
          if (item.committeeId != null && item.committeeId !== selectedCommitteeId) {
            return false;
          }
        } else {
          const assignedIds = assignedCommittees.map((c) => c.id);
          if (item.committeeId != null && !assignedIds.includes(item.committeeId)) {
            return false;
          }
        }
      }

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
  }, [dashboardData, organization, role, search, selectedCommitteeId, status]);

  const hasActiveFilters = Boolean(
    search.trim() || (role === 'DASIG_ADMIN' && organization !== 'ALL') || status !== 'ALL'
  );

  const handleResetFilters = () => {
    setSearch('');
    if (role === 'DASIG_ADMIN') {
      setOrganization('ALL');
    }
    setStatus('ALL');
  };

  const isAllCommitteesView = role === 'TBI_MANAGER' && selectedCommitteeId === null;

  const selectedCommittee = useMemo(
    () => dashboardData?.committees?.find((c) => c.id === selectedCommitteeId) ?? null,
    [dashboardData?.committees, selectedCommitteeId]
  );

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
      : role === 'TBI_MANAGER'
        ? selectedCommitteeId == null
          ? 'All Committees Dashboard'
          : `${selectedCommittee?.name ?? dashboardData?.committeeName ?? 'Committee'} KPI Dashboard`
        : `${dashboardData?.organizationName ?? 'Organization'} KPI Dashboard`;

  const resolvedSubtitle =
    role === 'TBI_MANAGER' && selectedCommitteeId == null
      ? 'Overview of assigned committees, key metrics, and performance progress.'
      : subtitle;

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
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            {role === 'TBI_MANAGER' && selectedCommitteeId != null && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={() => handleCommitteeChange(null)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                Back to All Committees
              </Button>
            )}
            <DashboardHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
          </Stack>
        }
        welcomeBanner={isAllCommitteesView ? null : <AdminKpiSummaryCards kpis={filteredKpis} />}
        topActions={topActions}
        filterBar={
          isAllCommitteesView ? null : (
            <KpiFilterBar
              search={search}
              status={status}
              organization={organization}
              organizations={organizations}
              showOrganization={role === 'DASIG_ADMIN'}
              organizationLocked={role !== 'DASIG_ADMIN'}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onOrganizationChange={setOrganization}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )
        }
        content={
          role === 'DASIG_ADMIN' ? (
            <KpiGrid
              title="All KPIs"
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
                  onViewHistory={handleViewHistoryClick}
                />
              )}
            />
          ) : isAllCommitteesView ? (
            <CommitteeCardsGrid
              committees={dashboardData?.committees ?? []}
              kpis={dashboardData?.kpis ?? []}
              search={search}
              onSearchChange={setSearch}
              onManageCommittee={(id) => handleCommitteeChange(id)}
            />
          ) : (
            <KpisList
              title={role === 'STAFF' ? 'Member KPIs' : `${selectedCommittee?.name ?? 'Committee'} KPIs`}
              kpis={filteredKpis}
              selectedId={null}
              onSelectKpi={handleSelectKpi}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          )
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

      <KpiPeriodHistoryDrawer
        open={historyDrawerOpen}
        kpi={selectedKpiForHistory}
        role={role}
        committeeId={role === 'TBI_MANAGER' ? selectedCommitteeId ?? undefined : undefined}
        onClose={() => {
          setHistoryDrawerOpen(false);
          setSelectedKpiForHistory(null);
        }}
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
