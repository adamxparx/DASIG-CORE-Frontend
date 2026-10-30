import { apiClient, apiGetCached } from '../../../lib/api/client';
import type { NotificationDetailResponse, NotificationResponse } from '../types/notification.types';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

export const notificationService = {
  getAll(): Promise<NotificationResponse[]> {
    return apiClient<NotificationResponse[]>(NOTIFICATIONS_ENDPOINT);
  },

  /** Number of unread notifications (sidebar badge). Cached briefly so both sidebars share one request. */
  getUnreadCount(): Promise<number> {
    return apiGetCached<number>(`${NOTIFICATIONS_ENDPOINT}/unread-count`, 5_000);
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
