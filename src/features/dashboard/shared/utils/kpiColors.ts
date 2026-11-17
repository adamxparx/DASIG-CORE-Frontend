import { getCalendarDaysUntilDeadline } from '../../../notification/utils/notificationDisplay';

/** Color for amounts (targets and submitted values). */
export const VALUE_COLOR = '#4F46E5';

/** Achievement rate colors: green = target reached, blue = 50% or more, orange = below 50%. */
export const RATE_STYLES = {
  reached: { color: '#14945F', bg: '#DDF4E8' },
  half: { color: '#1D4ED8', bg: '#EFF6FF' },
  low: { color: '#B06000', bg: '#FFF1D6' },
};

export const getRateStyle = (rate: number) =>
  rate >= 100 ? RATE_STYLES.reached : rate >= 50 ? RATE_STYLES.half : RATE_STYLES.low;

/** Days-left color: red when overdue, orange when 7 days or less remain. */
export const getDeadlineColor = (deadline: string, status?: string) => {
  const days = getCalendarDaysUntilDeadline(deadline);
  if (status === 'COMPLETED' || days === null) return 'text.secondary';
  if (days < 0) return '#C62828';
  if (days <= 7) return '#B06000';
  return 'text.secondary';
};
