export type NotificationType = 'SEVEN_DAYS_BEFORE' | 'TWO_DAYS_BEFORE';

export type NotificationStatus = 'UNREAD' | 'READ';

export interface NotificationResponse {
  id: number;
  kpiDefinitionId: number;
  kpiName: string;
  organizationId: number;
  notificationType: NotificationType;
  daysBeforeDeadline: number;
  deadline: string;
  status: NotificationStatus | string;
  message: string;
  createdAt: string;
}

export interface NotificationDetailResponse extends NotificationResponse {
  kpiDescription: string;
  organizationName: string;
}
