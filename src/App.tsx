import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import type { UserRole } from './features/auth/types/auth.types';
import { decodeJwtPayload, getDashboardPathForRole } from './features/auth/utils/jwt';
import { tokenStorage } from './features/auth/utils/tokenStorage';
import AdminDashboard from './features/dashboard/admin/pages/AdminDashboard';
import StaffDashboard from './features/dashboard/staff/pages/StaffDashboard';
import TbiManagerDashboard from './features/dashboard/tbi_manager/pages/TbiManagerDashboard';
import OrganizationManagementPage from './features/organization/pages/OrganizationManagementPage';
import UserManagementPage from './features/user/pages/UserManagementPage';
import { routes } from './routes';

function getSession() {
  const token = tokenStorage.get();
  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwtPayload(token);
    const dashboardPath = getDashboardPathForRole(payload.role);
    if (!dashboardPath) {
      tokenStorage.clear();
      return null;
    }

    return {
      role: payload.role as UserRole,
      dashboardPath,
    };
  } catch {
    tokenStorage.clear();
    return null;
  }
}

function LandingRoute() {
  const session = getSession();
  if (!session) {
    return <Navigate to={routes.auth} replace />;
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

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: ReactNode;
}

function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const session = getSession();
  if (!session) {
    return <Navigate to={routes.auth} replace />;
  }

  if (session.role !== requiredRole) {
    return <Navigate to={session.dashboardPath} replace />;
  }

  return (
    <>{children}</>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path={routes.auth} element={<AuthRoute />} />
        <Route
          path={routes.adminDashboard}
          element={
            <ProtectedRoute requiredRole="ROLE_DASIG_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.adminOrganizations}
          element={
            <ProtectedRoute requiredRole="ROLE_DASIG_ADMIN">
              <OrganizationManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.adminUsers}
          element={
            <ProtectedRoute requiredRole="ROLE_DASIG_ADMIN">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.staffDashboard}
          element={
            <ProtectedRoute requiredRole="ROLE_STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.tbiManagerDashboard}
          element={
            <ProtectedRoute requiredRole="ROLE_TBI_MANAGER">
              <TbiManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LandingRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
