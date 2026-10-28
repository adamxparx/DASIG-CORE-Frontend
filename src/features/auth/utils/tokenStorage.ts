import { AUTH_TOKEN_KEY } from '../constants';

export const SESSION_EXPIRES_AT_KEY = 'session_expires_at';
export const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(expiresAt));
  },

  getExpiresAt(): number | null {
    const raw = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
    return raw ? Number(raw) : null;
  },

  clear(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
  },
};
