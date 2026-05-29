import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import { getAuthRedirectPath, getSession } from './features/auth/utils/session';
import ProtectedDashboardLayout from './features/dashboard/shared/components/ProtectedDashboardLayout';
import AdminDashboard from './features/dashboard/admin/pages/AdminDashboard';
import StaffDashboard from './features/dashboard/staff/pages/StaffDashboard';
import TbiManagerDashboard from './features/dashboard/tbi_manager/pages/TbiManagerDashboard';
import StaffSubmissionHistoryPage from './features/kpisubmission/staff/pages/StaffSubmissionHistoryPage';
import StaffSubmitKpiPage from './features/kpisubmission/staff/pages/StaffSubmitKpiPage';
import TbiManagerSubmissionHistoryPage from './features/kpisubmission/tbi_manager/pages/TbiManagerSubmissionHistoryPage';
import TbiManagerSubmitKpiPage from './features/kpisubmission/tbi_manager/pages/TbiManagerSubmitKpiPage';
import OrganizationManagementPage from './features/organization/pages/OrganizationManagementPage';
import UserManagementPage from './features/user/pages/UserManagementPage';
import AdminAlertsPage from './features/alerts/pages/AdminAlertsPage';
import { routes } from './routes';

function LandingRoute() {
  const session = getSession();
  if (!session) {
    return <Navigate to={getAuthRedirectPath()} replace />;
  }

  return <Navigate to={session.dashboardPath} replace />;
}

function AuthRoute() {
  const session = getSession();
  if (session) {
    return <Navigate to={session.dashboardPath} replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path={routes.auth} element={<AuthRoute />} />

        <Route
          path="/dashboard/admin"
          element={<ProtectedDashboardLayout requiredRole="ROLE_DASIG_ADMIN" dashboardRole="DASIG_ADMIN" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="organizations" element={<OrganizationManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="alerts" element={<AdminAlertsPage />} />
        </Route>

        <Route
          path="/dashboard/staff"
          element={<ProtectedDashboardLayout requiredRole="ROLE_STAFF" dashboardRole="STAFF" />}
        >
          <Route index element={<StaffDashboard />} />
          <Route path="submit-kpi" element={<StaffSubmitKpiPage />} />
          <Route path="submission-history" element={<StaffSubmissionHistoryPage />} />
        </Route>

        <Route
          path="/dashboard/tbi_manager"
          element={<ProtectedDashboardLayout requiredRole="ROLE_TBI_MANAGER" dashboardRole="TBI_MANAGER" />}
        >
          <Route index element={<TbiManagerDashboard />} />
          <Route path="submit-kpi" element={<TbiManagerSubmitKpiPage />} />
          <Route path="submission-history" element={<TbiManagerSubmissionHistoryPage />} />
        </Route>

        <Route path="*" element={<LandingRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;