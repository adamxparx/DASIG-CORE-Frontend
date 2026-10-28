import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
import { routes } from '../../../../routes';
import { userService } from '../../../user/api/userService';
import type { UserRole } from '../types/dashboard.types';
import OrganizationAssignmentDialog from './OrganizationAssignmentDialog';
import InvalidAccountDialog from './InvalidAccountDialog';
import DashboardShellLayout from './DashboardShellLayout';

interface OrganizationGateProps {
  role: UserRole;
}

const isMicrosoftToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Boolean(
      payload.iss?.includes('login.microsoftonline.com') ||
      payload.tid ||
      (payload.roles && Array.isArray(payload.roles))
    );
  } catch {
    return false;
  }
};

const OrganizationGate = ({ role }: OrganizationGateProps) => {
  const { instance, accounts } = useMsal();
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isInactive, setIsInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOrganizationAndStatus = async () => {
      try {
        const token = tokenStorage.get();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // For Microsoft users, fetch current user profile to get status and organizationId
        // For local users, organizationId is in the JWT payload
        const isMicrosoftUser =
          accounts.length > 0 ||
          instance.getAllAccounts().length > 0 ||
          isMicrosoftToken(token);
        
        if (isMicrosoftUser) {
          const userProfile = await userService.getCurrentUser();
          if (userProfile.status && userProfile.status.toLowerCase() !== 'active') {
            setIsInactive(true);
          }
          setOrganizationId(userProfile.organizationId ?? null);
        } else {
          // Parse from JWT token
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          setOrganizationId(payload.organizationId ?? null);
        }
      } catch (error) {
        console.error('Failed to check organization/status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrganizationAndStatus();
  }, [accounts, instance]);

  const handleLogout = () => {
    tokenStorage.clear();
    if (accounts.length > 0 || instance.getAllAccounts().length > 0) {
      instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin + routes.auth });
    } else {
      window.location.href = routes.auth;
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Block inactive users authenticating through Microsoft authentication (both admin and non-admin)
  if (isInactive) {
    return (
      <InvalidAccountDialog
        open={true}
        onLogout={handleLogout}
      />
    );
  }

  // Active DASIG_ADMIN always has organization (ID 1), skip organization check
  if (role === 'DASIG_ADMIN') {
    return <DashboardShellLayout role={role} />;
  }

  if (organizationId === null) {
    return (
      <OrganizationAssignmentDialog
        open={true}
        onLogout={handleLogout}
      />
    );
  }

  return <DashboardShellLayout role={role} />;
};

export default OrganizationGate;
