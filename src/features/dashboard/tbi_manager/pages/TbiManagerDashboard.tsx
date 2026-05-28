import RoleBasedDashboardPage from '../../shared/components/RoleBasedDashboardPage';

const TbiManagerDashboard = () => {
  return (
    <RoleBasedDashboardPage
      role="TBI_MANAGER"
      title="Organization KPI Dashboard"
      subtitle="Review assigned KPIs and submit progress updates."
      welcomeMessage="Welcome, TBI Manager"
    />
  );
};

export default TbiManagerDashboard;