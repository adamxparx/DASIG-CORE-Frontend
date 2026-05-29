import type { NotificationType } from '../types/notification.types';

export function isUnreadNotification(status: string): boolean {
  return status.toUpperCase() === 'UNREAD';
}

/** Calendar date only (YYYY-MM-DD), local timezone — avoids UTC shift from toISOString(). */
export function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Dates that match backend ChronoUnit day diff (app.business-timezone, default Asia/Manila). */
export function getDeadlineAlertTestDates(referenceDate = new Date()): {
  sevenDayDeadline: string;
  twoDayDeadline: string;
} {
  const today = new Date(referenceDate);
  today.setHours(12, 0, 0, 0);
  return {
    sevenDayDeadline: formatCalendarDate(addCalendarDays(today, 7)),
    twoDayDeadline: formatCalendarDate(addCalendarDays(today, 2)),
  };
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

export function getDeadlineFieldHelperText(deadline: string): string {
  const { sevenDayDeadline, twoDayDeadline } = getDeadlineAlertTestDates();
  const leadDays = deadline ? getDeadlineAlertLeadDays(deadline) : null;

  if (leadDays === 7) {
    return 'Staff/TBI will get a 7-day deadline alert when you save.';
  }
  if (leadDays === 2) {
    return 'Staff/TBI will get a 2-day deadline alert when you save.';
  }
  if (deadline) {
    return `No alert for this date. For testing, use ${sevenDayDeadline} (7-day) or ${twoDayDeadline} (2-day).`;
  }
  return `Alerts only on exact dates: ${sevenDayDeadline} (7-day) or ${twoDayDeadline} (2-day). KPI creation time does not matter.`;
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
