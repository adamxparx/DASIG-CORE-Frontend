import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../../lib/api/client';
import DashboardViewToggle from '../../admin/components/DashboardViewToggle';
import CreateKpiButton from '../../admin/components/CreateKpiButton';
import { dashboardService } from '../api/dashboardService';
import type { DashboardApiResponse, DashboardStatus, DashboardViewMode, UserRole } from '../types/dashboard.types';
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

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const response = await dashboardService.getDashboard();
        if (!mounted) {
          return;
        }

        setDashboardData(response);
        if (response.organizationName && role !== 'DASIG_ADMIN') {
          setOrganization(response.organizationName);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err instanceof ApiError ? err.message : 'Unable to load dashboard data.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [role]);

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
        <CreateKpiButton onClick={() => undefined} />
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
          gridColumns={role === 'DASIG_ADMIN' ? 3 : 2}
          renderItem={(item) => <KpiDashboardCard key={item.id} item={item} role={role} />}
        />
      }
    />
  );
};

export default RoleBasedDashboardPage;
