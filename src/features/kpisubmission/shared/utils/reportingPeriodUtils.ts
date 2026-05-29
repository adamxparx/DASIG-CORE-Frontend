export type ReportingFrequency = 'ONE_TIME' | 'QUARTERLY' | 'ANNUAL' | 'MONTHLY';

export const REPORTING_FREQUENCY_OPTIONS: { value: ReportingFrequency; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time (by deadline)' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseDate = (rawDate: string): Date => new Date(`${rawDate}T00:00:00`);

const formatOneTime = (deadline: string): string => {
  const date = parseDate(deadline);
  const month = MONTH_NAMES[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `Due by ${month} ${day}, ${year}`;
};

const formatQuarter = (quarter: number, year: number): string => `Q${quarter} ${year}`;

const formatMonth = (year: number, monthIndex: number): string =>
  `${MONTH_NAMES[monthIndex]} ${year}`;

const quarterEndDate = (year: number, quarter: number): Date =>
  new Date(year, quarter * 3 - 1 + 1, 0);

const generateQuarterly = (start: Date, deadline: Date): string[] => {
  const periods: string[] = [];
  const startYear = start.getFullYear();
  const endYear = deadline.getFullYear();

  for (let year = startYear; year <= endYear; year += 1) {
    for (let quarter = 1; quarter <= 4; quarter += 1) {
      const quarterEnd = quarterEndDate(year, quarter);
      if (quarterEnd >= start && quarterEnd <= deadline) {
        periods.push(formatQuarter(quarter, year));
      }
    }
  }
  return periods;
};

const generateAnnual = (start: Date, deadline: Date): string[] => {
  const periods: string[] = [];
  for (let year = start.getFullYear(); year <= deadline.getFullYear(); year += 1) {
    periods.push(String(year));
  }
  return periods;
};

const generateMonthly = (start: Date, deadline: Date): string[] => {
  const periods: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(deadline.getFullYear(), deadline.getMonth(), 1);

  while (cursor <= end) {
    periods.push(formatMonth(cursor.getFullYear(), cursor.getMonth()));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return periods;
};

export const getPeriodOptions = (
  frequency: ReportingFrequency,
  deadline: string,
  assignmentStart?: string
): string[] => {
  if (!deadline) {
    return [];
  }

  const deadlineDate = parseDate(deadline);
  const startDate = assignmentStart ? parseDate(assignmentStart) : new Date();

  switch (frequency) {
    case 'ONE_TIME':
      return [formatOneTime(deadline)];
    case 'QUARTERLY':
      return generateQuarterly(startDate, deadlineDate);
    case 'ANNUAL':
      return generateAnnual(startDate, deadlineDate);
    case 'MONTHLY':
      return generateMonthly(startDate, deadlineDate);
    default:
      return generateQuarterly(startDate, deadlineDate);
  }
};

export const getCurrentPeriod = (
  frequency: ReportingFrequency,
  deadline: string,
  assignmentStart?: string,
  asOf: Date = new Date()
): string | null => {
  const options = getPeriodOptions(frequency, deadline, assignmentStart);
  if (options.length === 0) {
    return null;
  }

  const deadlineDate = parseDate(deadline);
  const referenceDate = asOf > deadlineDate ? deadlineDate : asOf;

  let candidate: string;
  switch (frequency) {
    case 'ONE_TIME':
      candidate = formatOneTime(deadline);
      break;
    case 'QUARTERLY':
      candidate = formatQuarter(Math.floor(referenceDate.getMonth() / 3) + 1, referenceDate.getFullYear());
      break;
    case 'ANNUAL':
      candidate = String(referenceDate.getFullYear());
      break;
    case 'MONTHLY':
      candidate = formatMonth(referenceDate.getFullYear(), referenceDate.getMonth());
      break;
    default:
      candidate = formatQuarter(Math.floor(referenceDate.getMonth() / 3) + 1, referenceDate.getFullYear());
  }

  if (options.includes(candidate)) {
    return candidate;
  }

  return options[options.length - 1] ?? null;
};
