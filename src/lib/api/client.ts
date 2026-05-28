import { getApiUrl } from '../../config/api';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';

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

function parseErrorMessage(status: number, bodyText: string): string {
  if (bodyText) {
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
    return 'Invalid email or password.';
  }

  return 'Something went wrong. Please try again.';
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

  if (!response.ok) {
    throw new ApiError(parseErrorMessage(response.status, bodyText), response.status);
  }

  if (!bodyText) {
    throw new ApiError('Empty response from server.', response.status);
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new ApiError('Invalid response from server.', response.status);
  }
}
