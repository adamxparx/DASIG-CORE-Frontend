export type UserRole = 'DASIG_ADMIN' | 'TBI_MANAGER' | 'STAFF';

export type ReportingFrequency = 'ONE_TIME' | 'QUARTERLY' | 'ANNUAL' | 'MONTHLY';

export type DashboardStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED';

export type DashboardViewMode = 'grid' | 'list';

export interface DashboardKpiItem {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  submittedValue: number;
  unit: string;
  deadline: string;
  organization: string;
  status: DashboardStatus;
  reportingFrequency?: ReportingFrequency;
  reportingPeriod?: string | null;
}

export interface DashboardApiResponse {
  role: UserRole;
  organizationId: number | null;
  organizationName: string | null;
  reportingPeriod?: string | null;
  kpis: DashboardKpiItem[];
}

export interface KpiPeriodSubmissionEntry {
  id: number;
  submissionType: 'INTERNAL' | 'FINAL';
  submittedValue: number;
  achievementRate: number;
  performanceStatus: string;
  submittedByName: string;
  submittedByRole: string;
  submissionDate: string;
}

export interface KpiPeriodHistoryItem {
  reportingPeriod: string;
  current: boolean;
  submissions: KpiPeriodSubmissionEntry[];
}

export interface KpiPeriodHistoryResponse {
  kpiDefinitionId: number;
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string;
  reportingFrequency: ReportingFrequency;
  currentPeriod: string | null;
  organization: string;
  periods: KpiPeriodHistoryItem[];
}
