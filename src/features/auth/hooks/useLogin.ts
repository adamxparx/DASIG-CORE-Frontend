import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/api/client';
import { authService } from '../api/authService';
import type { LoginRequest } from '../types/auth.types';
import { decodeJwtPayload, getDashboardPathForRole } from '../utils/jwt';
import { tokenStorage } from '../utils/tokenStorage';

type LoginStatus = 'idle' | 'loading' | 'error';

export function useLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setStatus('loading');
      setError(null);

      try {
        const response = await authService.login(credentials);

        if (!response.token) {
          throw new ApiError('Login response did not include a token.', 200);
        }

        const { role } = decodeJwtPayload(response.token);
        const dashboardPath = getDashboardPathForRole(role);

        if (!dashboardPath) {
          tokenStorage.clear();
          throw new ApiError(
            'Your account role is not recognized. Please contact an administrator.',
            200,
          );
        }

        tokenStorage.set(response.token);
        navigate(dashboardPath, { replace: true });
      } catch (err) {
        setStatus('error');
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to reach the server. Make sure the backend is running.',
        );
      }
    },
    [navigate],
  );

  return {
    login,
    error,
    isLoading: status === 'loading',
  };
}
