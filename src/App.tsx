import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getSession } from './features/auth/utils/session';
import ProtectedDashboardLayout from './features/dashboard/shared/components/ProtectedDashboardLayout';
// Sign-in pages load with the app so login and logout show no extra loading step
import LoginPage from './features/auth/pages/LoginPage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import LandingPage from './features/landing/pages/LandingPage';
import { routes } from './routes';

// Dashboard pages are downloaded only when first opened, so the first load stays small
const AdminDashboard = lazy(() => import('./features/dashboard/admin/pages/AdminDashboard'));
const StaffDashboard = lazy(() => import('./features/dashboard/staff/pages/StaffDashboard'));
const TbiManagerDashboard = lazy(() => import('./features/dashboard/tbi_manager/pages/TbiManagerDashboard'));
const StaffSubmissionHistoryPage = lazy(() => import('./features/kpisubmission/staff/pages/StaffSubmissionHistoryPage'));
const StaffSubmitKpiPage = lazy(() => import('./features/kpisubmission/staff/pages/StaffSubmitKpiPage'));
const TbiManagerSubmissionHistoryPage = lazy(() => import('./features/kpisubmission/tbi_manager/pages/TbiManagerSubmissionHistoryPage'));
const TbiManagerSubmitKpiPage = lazy(() => import('./features/kpisubmission/tbi_manager/pages/TbiManagerSubmitKpiPage'));
const StaffNotificationsPage = lazy(() => import('./features/notification/staff/pages/StaffNotificationsPage'));
const TbiManagerNotificationsPage = lazy(() => import('./features/notification/tbi_manager/pages/TbiManagerNotificationsPage'));
const OrganizationManagementPage = lazy(() => import('./features/organization/pages/OrganizationManagementPage'));
const UserManagementPage = lazy(() => import('./features/user/pages/UserManagementPage'));
const AdminAlertsPage = lazy(() => import('./features/alerts/pages/AdminAlertsPage'));
const ReportGenerationPage = lazy(() => import('./features/report/pages/ReportGenerationPage'));
const CommitteeManagementPage = lazy(() => import('./features/committee/pages/CommitteeManagementPage'));
const KpiDetailPage = lazy(() => import('./features/dashboard/admin/pages/KpiDetailPage'));
const CreateKpiPage = lazy(() => import('./features/dashboard/admin/pages/CreateKpiPage'));

function LandingRoute() {
  const session = getSession();
  if (!session) {
    return <LandingPage />;
  }

  // Post-login deep-link priority: if a deep link was saved (e.g. from an email),
  // navigate there instead of the default dashboard root.
  const postLoginRedirect = sessionStorage.getItem('postLoginRedirect');
  if (postLoginRedirect) {
    sessionStorage.removeItem('postLoginRedirect');
    return <Navigate to={postLoginRedirect} replace />;
  }

  return <Navigate to={session.dashboardPath} replace />;
}

function AuthRoute() {
  const session = getSession();
  if (session) {
    // Post-login deep-link priority takes precedence over default dashboard path
    const postLoginRedirect = sessionStorage.getItem('postLoginRedirect');
    if (postLoginRedirect) {
      sessionStorage.removeItem('postLoginRedirect');
      return <Navigate to={postLoginRedirect} replace />;
    }

    return <Navigate to={session.dashboardPath} replace />;
  }

  return <LoginPage />;
}

function ChangePasswordRoute() {
  const session = getSession();
  if (!session) {
    return <Navigate to={routes.auth} replace />;
  }

  return <ChangePasswordPage />;
}

function App() {
  return (
    <BrowserRouter>
      {/* Dashboard pages show their own placeholder inside the dashboard, so nothing is needed here */}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path={routes.auth} element={<AuthRoute />} />
          <Route path={routes.changePassword} element={<ChangePasswordRoute />} />

          <Route
            path="/dashboard/admin"
            element={<ProtectedDashboardLayout requiredRole="ROLE_DASIG_ADMIN" dashboardRole="DASIG_ADMIN" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="kpis" element={<AdminDashboard />} />
            <Route path="organizations" element={<OrganizationManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="committees" element={<CommitteeManagementPage />} />
            <Route path="alerts" element={<AdminAlertsPage />} />
            <Route path="reports" element={<ReportGenerationPage />} />
            <Route path="kpis/create" element={<CreateKpiPage />} />
            <Route path="kpis/:id/edit" element={<CreateKpiPage />} />
            <Route path="kpis/:id" element={<KpiDetailPage />} />
          </Route>

          <Route
            path="/dashboard/staff"
            element={<ProtectedDashboardLayout requiredRole="ROLE_STAFF" dashboardRole="STAFF" />}
          >
            <Route index element={<StaffDashboard />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
            <Route path="submit-kpi" element={<StaffSubmitKpiPage />} />
            <Route path="submission-history" element={<StaffSubmissionHistoryPage />} />
            <Route path="kpis/:id" element={<KpiDetailPage />} />
          </Route>

          <Route
            path="/dashboard/tbi_manager"
            element={<ProtectedDashboardLayout requiredRole="ROLE_TBI_MANAGER" dashboardRole="TBI_MANAGER" />}
          >
            <Route index element={<TbiManagerDashboard />} />
            <Route path="notifications" element={<TbiManagerNotificationsPage />} />
            <Route path="submit-kpi" element={<TbiManagerSubmitKpiPage />} />
            <Route path="submission-history" element={<TbiManagerSubmissionHistoryPage />} />
            <Route path="kpis/:id" element={<KpiDetailPage />} />
          </Route>

          <Route path="*" element={<LandingRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;