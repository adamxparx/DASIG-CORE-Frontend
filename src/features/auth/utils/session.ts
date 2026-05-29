import { routes } from '../../../routes';
import type { JwtPayload, UserRole } from '../types/auth.types';
import { decodeJwtPayload, getDashboardPathForRole } from './jwt';
import { tokenStorage } from './tokenStorage';

export interface AppSession {
  role: UserRole;
  dashboardPath: string;
  payload: JwtPayload;
}

export function getSession(): AppSession | null {
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
      payload,
    };
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export function getAuthRedirectPath(): string {
  return routes.auth;
}
