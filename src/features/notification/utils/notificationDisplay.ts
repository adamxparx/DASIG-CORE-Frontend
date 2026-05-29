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

/** Matches backend: alerts when KPI deadline equals today+7 or today+2 (calendar days, not time of day). */
export function getDeadlineAlertLeadDays(deadline: string): 7 | 2 | null {
  const diffDays = getCalendarDaysUntilDeadline(deadline);
  if (diffDays === 7) {
    return 7;
  }
  if (diffDays === 2) {
    return 2;
  }
  return null;
}

export function getDeadlineFieldHelperText(deadline: string): string | undefined {
  const leadDays = getDeadlineAlertLeadDays(deadline);
  if (leadDays === 7) {
    return 'Staff/TBI will get a 7-day deadline alert when you save.';
  }
  if (leadDays === 2) {
    return 'Staff/TBI will get a 2-day deadline alert when you save.';
  }
  return undefined;
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
    case 'SEVEN_DAYS_BEFORE':
      return '7 days before deadline';
    case 'TWO_DAYS_BEFORE':
      return '2 days before deadline';
    default:
      return 'Deadline alert';
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
