import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { getAuthRedirectPath, getSession } from '../../../auth/utils/session';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
import type { UserRole as AuthUserRole } from '../../../auth/types/auth.types';
import type { UserRole as DashboardUserRole } from '../types/dashboard.types';
import { routes } from '../../../../routes';
import OrganizationGate from './OrganizationGate';

interface ProtectedDashboardLayoutProps {
  requiredRole: AuthUserRole;
  dashboardRole: DashboardUserRole;
}

const ProtectedDashboardLayout = ({ requiredRole, dashboardRole }: ProtectedDashboardLayoutProps) => {
  const { instance, accounts } = useMsal();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const handleSessionTimeout = () => {
      tokenStorage.clear();
      sessionStorage.setItem('sessionTimedOut', 'true');
      setSession(null);

      if (accounts.length > 0 || instance.getAllAccounts().length > 0) {
        instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin + routes.auth });
      } else {
        window.location.href = routes.auth;
      }
    };

    const currentSession = getSession();
    if (!currentSession) {
      handleSessionTimeout();
      return;
    }

    if (!currentSession.expiresAt) {
      return;
    }

    const remainingMs = currentSession.expiresAt - Date.now();
    if (remainingMs <= 0) {
      handleSessionTimeout();
      return;
    }

    const timer = setTimeout(() => {
      handleSessionTimeout();
    }, remainingMs);

    // Periodic check every 5 seconds in case tab was backgrounded or system clock changed
    const interval = setInterval(() => {
      const active = getSession();
      if (!active) {
        handleSessionTimeout();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [accounts, instance]);

  if (!session) {
    // Preserve the incoming deep-link query params (e.g. ?alertId=123&loginHint=...)
    // so they survive the redirect to the auth page and MSAL can consume loginHint.
    const search = window.location.search;
    return <Navigate to={`${getAuthRedirectPath()}${search}`} replace />;
  }

  if (session.mustChangePassword) {
    return <Navigate to={routes.changePassword} replace />;
  }

  if (session.role !== requiredRole) {
    return <Navigate to={session.dashboardPath} replace />;
  }

  return <OrganizationGate role={dashboardRole} />;
};

export default ProtectedDashboardLayout;
