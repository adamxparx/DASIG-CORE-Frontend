import RoleBasedDashboardPage from '../../shared/components/RoleBasedDashboardPage';

const StaffDashboard = () => {
  return (
    <RoleBasedDashboardPage
      role="STAFF"
      title="Organization KPI Dashboard"
      subtitle="Track assigned KPIs and maintain on-time submissions."
    />
  );
};

export default StaffDashboard;