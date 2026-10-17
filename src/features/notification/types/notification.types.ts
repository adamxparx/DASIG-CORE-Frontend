export type NotificationType =
  | 'SEVEN_DAYS_BEFORE'
  | 'TWO_DAYS_BEFORE'
  | 'AT_RISK'
  | 'OVERDUE'
  | 'ALERT_ACKNOWLEDGED'
  | 'DEADLINE_UPDATED';

export type NotificationStatus = 'UNREAD' | 'READ';

export interface NotificationResponse {
  id: number;
  kpiDefinitionId: number;
  kpiName: string;
  organizationId: number;
  notificationType: NotificationType;
  /** Only set for deadline reminders; null for alert-related notification types. */
  daysBeforeDeadline: number | null;
  deadline: string;
  status: NotificationStatus | string;
  message: string;
  createdAt: string;
  /** The alert this notification is about (At Risk, Overdue, Alert Acknowledged); null otherwise. */
  alertId?: number | null;
}

export interface NotificationDetailResponse extends NotificationResponse {
  kpiDescription: string;
  organizationName: string;
}
