import type { NotificationType } from '../types/notification.types';

export function isUnreadNotification(status: string): boolean {
  return status.toUpperCase() === 'UNREAD';
}

/** Whole calendar days from reference date to deadline (matches backend LocalDate day diff). */
export function getCalendarDaysUntilDeadline(
  deadline: string,
  referenceDate = new Date(),
): number | null {
  const today = new Date(referenceDate);
  today.setHours(12, 0, 0, 0);

  const target = new Date(`${deadline}T12:00:00`);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function getDaysLeftLabel(deadline: string): string {
  const diffInDays = getCalendarDaysUntilDeadline(deadline);
  if (diffInDays === null) {
    return '';
  }
  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days overdue`;
  }
  if (diffInDays === 0) {
    return 'Due today';
  }
  return `${diffInDays} days left`;
}

export function sortNotifications<T extends { status: string; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aUnread = isUnreadNotification(a.status);
    const bUnread = isUnreadNotification(b.status);
    if (aUnread !== bUnread) {
      return aUnread ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function formatNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'AT_RISK':
      return 'At risk';
    case 'OVERDUE':
      return 'Overdue';
    case 'ALERT_ACKNOWLEDGED':
      return 'Alert acknowledged';
    case 'DEADLINE_UPDATED':
      return 'Deadline updated';
    default:
      return 'Notification';
  }
}

/** Chip color for each notification type. */
export function getNotificationTypeColor(type: NotificationType): 'info' | 'warning' | 'error' | 'success' {
  switch (type) {
    case 'OVERDUE':
      return 'error';
    case 'AT_RISK':
      return 'warning';
    case 'ALERT_ACKNOWLEDGED':
      return 'success';
    default:
      return 'info';
  }
}

export function formatNotificationDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNotificationDateTime(dateTime: string): string {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
