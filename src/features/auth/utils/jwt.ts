import { routes } from '../../../routes';
import type { JwtPayload, UserRole } from '../types/auth.types';

const ROLE_DASHBOARD: Record<UserRole, string> = {
  ROLE_DASIG_ADMIN: routes.adminDashboard,
  ROLE_STAFF: routes.staffDashboard,
  ROLE_TBI_MANAGER: routes.tbiManagerDashboard,
};

export function decodeJwtPayload(token: string): JwtPayload {
  const [, payload] = token.split('.');
  if (!payload) {
    throw new Error('Invalid token');
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(normalized)) as JwtPayload;
}

export function getDashboardPathForRole(role: string | undefined): string | null {
  if (!role || !(role in ROLE_DASHBOARD)) {
    return null;
  }

  return ROLE_DASHBOARD[role as UserRole];
}
