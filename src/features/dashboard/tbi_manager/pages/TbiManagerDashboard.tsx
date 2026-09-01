import RoleBasedDashboardPage from '../../shared/components/RoleBasedDashboardPage';

const TbiManagerDashboard = () => {
  return (
    <RoleBasedDashboardPage
      role="TBI_MANAGER"
      title="Committee KPI Dashboard"
      subtitle="Review assigned KPIs and submit progress updates."
    />
  );
};

export default TbiManagerDashboard;