import RoleBasedDashboardPage from '../../shared/components/RoleBasedDashboardPage';

const AdminDashboard = () => {
  return (
    <RoleBasedDashboardPage
      role="DASIG_ADMIN"
      title="KPI Management Hub"
      subtitle="Monitor consortium-wide KPI definitions and performance updates."
      welcomeMessage="Welcome, DASIG Admin"
    />
  );
};

export default AdminDashboard;