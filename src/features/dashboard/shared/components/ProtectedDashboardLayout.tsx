import { Navigate } from 'react-router-dom';
import { getAuthRedirectPath, getSession } from '../../../auth/utils/session';
import type { UserRole as AuthUserRole } from '../../../auth/types/auth.types';
import type { UserRole as DashboardUserRole } from '../types/dashboard.types';
import DashboardShellLayout from './DashboardShellLayout';

interface ProtectedDashboardLayoutProps {
  requiredRole: AuthUserRole;
  dashboardRole: DashboardUserRole;
}

const ProtectedDashboardLayout = ({ requiredRole, dashboardRole }: ProtectedDashboardLayoutProps) => {
  const session = getSession();

  if (!session) {
    return <Navigate to={getAuthRedirectPath()} replace />;
  }

  if (session.role !== requiredRole) {
    return <Navigate to={session.dashboardPath} replace />;
  }

  return <DashboardShellLayout role={dashboardRole} />;
};

export default ProtectedDashboardLayout;
