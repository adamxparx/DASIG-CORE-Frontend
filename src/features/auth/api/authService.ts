import { apiClient } from '../../../lib/api/client';
import { AUTH_ENDPOINTS } from '../constants';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>(AUTH_ENDPOINTS.login, {
      method: 'POST',
      body: credentials,
    });
  },
};
