import { getApiUrl } from '../../config/api';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';
import { routes } from '../../routes';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

function parseErrorMessage(status: number, bodyText: string, path: string): string {
  if (bodyText && !bodyText.trim().startsWith('<')) {
    try {
      const body = JSON.parse(bodyText) as {
        message?: string;
        detail?: string;
        error?: string;
      };
      if (body.message) return body.message;
      if (body.detail) return body.detail;
      if (body.error) return body.error;
    } catch {
      return bodyText;
    }
  }

  if (status === 401) {
    if (path.includes('/auth/login')) {
      return 'Invalid email or password.';
    }
    return 'Session expired or unauthorized access.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  return 'Something went wrong. Please try again.';
}

// Short-lived cache for reads that several components need at the same time
// (for example, the KPI detail page and its header both need the dashboard).
// Keyed by token so users never share entries. Any change (POST/PUT/PATCH/DELETE) clears it.
const readCache = new Map<string, { expiresAt: number; promise: Promise<unknown> }>();

export function clearApiCache(): void {
  readCache.clear();
}

export function apiGetCached<T>(path: string, ttlMs = 30_000): Promise<T> {
  const key = `${tokenStorage.get() ?? ''}|${path}`;
  const cached = readCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise as Promise<T>;
  }

  const promise = apiClient<T>(path);
  readCache.set(key, { expiresAt: Date.now() + ttlMs, promise });
  promise.catch(() => readCache.delete(key));
  return promise;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const token = tokenStorage.get();

  const response = await fetch(getApiUrl(path), {
    method,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const bodyText = await response.text();

  if (method !== 'GET') {
    clearApiCache();
  }

  if (!response.ok) {
    // Auto-logout on session expiration (401): clear the stored JWT and redirect to /auth
    if (response.status === 401 && !path.includes('/auth/login')) {
      tokenStorage.clear();
      sessionStorage.setItem('sessionTimedOut', 'true');
      window.location.href = routes.auth;
    }
    throw new ApiError(parseErrorMessage(response.status, bodyText, path), response.status);
  }

  if (!bodyText) {
    if (response.ok) {
      return undefined as unknown as T;
    }
    throw new ApiError('Empty response from server.', response.status);
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new ApiError('Invalid response from server.', response.status);
  }
}
