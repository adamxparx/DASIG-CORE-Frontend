import { apiClient } from '../../../lib/api/client';
import type { NotificationDetailResponse, NotificationResponse } from '../types/notification.types';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

export const notificationService = {
  getAll(): Promise<NotificationResponse[]> {
    return apiClient<NotificationResponse[]>(NOTIFICATIONS_ENDPOINT);
  },

  getById(id: number): Promise<NotificationDetailResponse> {
    return apiClient<NotificationDetailResponse>(`${NOTIFICATIONS_ENDPOINT}/${id}`);
  },

  markAsRead(id: number): Promise<NotificationDetailResponse> {
    return apiClient<NotificationDetailResponse>(`${NOTIFICATIONS_ENDPOINT}/${id}/read`, {
      method: 'PATCH',
    });
  },
};
