import { apiClient } from '../../../lib/api/client';

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const accountService = {
  changePassword(payload: ChangePasswordRequest): Promise<void> {
    return apiClient<void>('/api/account/password', {
      method: 'PUT',
      body: payload,
    });
  },
};
