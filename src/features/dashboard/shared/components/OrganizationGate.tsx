import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
import { routes } from '../../../../routes';
import { userService } from '../../../user/api/userService';
import { organizationService } from '../../../organization/api/organizationService';
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

// Sidebar colour per role, matching DashboardSidebar
const SIDEBAR_COLORS: Record<UserRole, string> = {
  DASIG_ADMIN: '#426ef0',
  TBI_MANAGER: '#7C3AED',
  STAFF: '#059669',
};

// The last /users/me result for this sign-in, kept for the browser tab so a reload
// can show the dashboard right away while the check runs again in the background.
const GATE_CACHE_KEY = 'dasig:userGate';

interface GateResult {
  organizationId: number | null;
  inactive: boolean;
}

// Identifies who is signed in (the Microsoft token is renewed often, so the token itself is not used)
const signedInUser = (token: string): string => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload.preferred_username ?? payload.email ?? payload.sub ?? '');
  } catch {
    return '';
  }
};

const readCachedGate = (): GateResult | null => {
  const token = tokenStorage.get();
  if (!token) {
    return null;
  }
  try {
    const cached = JSON.parse(sessionStorage.getItem(GATE_CACHE_KEY) ?? 'null');
    const user = signedInUser(token);
    return user && cached?.user === user ? (cached.result as GateResult) : null;
  } catch {
    return null;
  }
};

const readLocalGate = (token: string): GateResult | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { organizationId: payload.organizationId ?? null, inactive: false };
  } catch {
    return null;
  }
};

// Local accounts carry their organization in the token, so the dashboard can show at once.
// Microsoft accounts use the last /users/me result for this tab, if there is one.
const readInitialGate = (hasMicrosoftAccount: boolean): GateResult | null => {
  const token = tokenStorage.get();
  if (!token) {
    return null;
  }
  if (!hasMicrosoftAccount && !isMicrosoftToken(token)) {
    return readLocalGate(token);
  }
  return readCachedGate();
};

const saveCachedGate = (token: string, result: GateResult) => {
  try {
    sessionStorage.setItem(GATE_CACHE_KEY, JSON.stringify({ user: signedInUser(token), result }));
  } catch {
    // Storage unavailable; the check simply runs again next time
  }
};

const OrganizationGate = ({ role }: OrganizationGateProps) => {
  const { instance, accounts } = useMsal();
  const [initialGate] = useState(() => readInitialGate(instance.getAllAccounts().length > 0));
  const [organizationId, setOrganizationId] = useState<number | null>(initialGate?.organizationId ?? null);
  const [isInactive, setIsInactive] = useState(initialGate?.inactive ?? false);
  const [isOrgInactive, setIsOrgInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(initialGate === null);

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
          const result: GateResult = {
            organizationId: userProfile.organizationId ?? null,
            inactive: Boolean(userProfile.status && userProfile.status.toLowerCase() !== 'active'),
          };
          setIsInactive(result.inactive);
          setOrganizationId(result.organizationId);
          saveCachedGate(token, result);
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

  useEffect(() => {
    const checkOrganizationStatus = async () => {
      if (role === 'DASIG_ADMIN' || organizationId === null || isInactive) {
        return;
      }

      try {
        const org = await organizationService.getById ? await organizationService.getById(organizationId) : await organizationService.getAll().then(orgs => orgs.find(o => o.id === organizationId));
        if (org && org.status && org.status.toLowerCase() !== 'active') {
          setIsOrgInactive(true);
        }
      } catch (error) {
        console.error('Failed to check organization status:', error);
      }
    };

    checkOrganizationStatus();
  }, [organizationId, role, isInactive]);

  const handleLogout = () => {
    tokenStorage.clear();
    if (accounts.length > 0 || instance.getAllAccounts().length > 0) {
      instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin + routes.auth });
    } else {
      window.location.href = routes.auth;
    }
  };

  if (isLoading) {
    // Same shape as the dashboard (and the first loading screen in index.html) while the check runs
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 280,
            height: '100vh',
            bgcolor: SIDEBAR_COLORS[role],
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Box>
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

  // Block if organization is inactive (for non-admin users)
  if (isOrgInactive) {
    return (
      <InvalidAccountDialog
        open={true}
        onLogout={handleLogout}
        title="Organization Inactive"
        message="Your organization's account is currently inactive. Please contact your administrator."
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
