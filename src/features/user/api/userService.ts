import { apiClient } from '../../../lib/api/client';
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';

const USERS_ENDPOINT = '/api/users';

export const userService = {
  getAll(): Promise<UserResponse[]> {
    return apiClient<UserResponse[]>(USERS_ENDPOINT);
  },

  getById(id: number): Promise<UserResponse> {
    return apiClient<UserResponse>(`${USERS_ENDPOINT}/${id}`);
  },

  create(request: CreateUserRequest): Promise<UserResponse> {
    return apiClient<UserResponse>(USERS_ENDPOINT, {
      method: 'POST',
      body: request,
    });
  },

  update(id: number, request: UpdateUserRequest): Promise<UserResponse> {
    return apiClient<UserResponse>(`${USERS_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: request,
    });
  },

  deactivate(id: number): Promise<void> {
    return apiClient<void>(`${USERS_ENDPOINT}/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};
