import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../../lib/api/client';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
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
      const committee = item.committeeName || item.organization;
      if (committee && committee.trim()) {
        orgs.add(committee.trim());
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

      if (committeeFilter !== 'ALL') {
        const committee = item.committeeName || item.organization;
        if (committee !== committeeFilter) {
          return false;
        }
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
            title={null}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        }
      />
    </>
  );
};

export default AdminKpiManagementPage;
