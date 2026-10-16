import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
import { routes } from '../../../../routes';
import { userService } from '../../../user/api/userService';
import type { UserRole } from '../types/dashboard.types';
import OrganizationAssignmentDialog from './OrganizationAssignmentDialog';
import DashboardShellLayout from './DashboardShellLayout';

interface OrganizationGateProps {
  role: UserRole;
}

const OrganizationGate = ({ role }: OrganizationGateProps) => {
  const { instance, accounts } = useMsal();
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOrganization = async () => {
      try {
        const token = tokenStorage.get();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // For Microsoft users, fetch current user profile to get organizationId
        // For local users, organizationId is in the JWT payload
        const isMicrosoftUser = accounts.length > 0;
        
        if (isMicrosoftUser) {
          const userProfile = await userService.getCurrentUser();
          setOrganizationId(userProfile.organizationId ?? null);
        } else {
          // Parse from JWT token
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          setOrganizationId(payload.organizationId ?? null);
        }
      } catch (error) {
        console.error('Failed to check organization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrganization();
  }, [accounts]);

  // DASIG_ADMIN always has organization (ID 1), skip check
  if (role === 'DASIG_ADMIN') {
    return <DashboardShellLayout role={role} />;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (organizationId === null) {
    return (
      <OrganizationAssignmentDialog
        open={true}
        onLogout={() => {
          tokenStorage.clear();
          if (accounts.length > 0) {
            instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin + routes.auth });
          } else {
            window.location.href = routes.auth;
          }
        }}
      />
    );
  }

  return <DashboardShellLayout role={role} />;
};

export default OrganizationGate;