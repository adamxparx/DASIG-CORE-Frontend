export type UserRole = 'DASIG_ADMIN' | 'TBI_MANAGER' | 'STAFF';

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
}

export interface DashboardApiResponse {
  role: UserRole;
  organizationId: number | null;
  organizationName: string | null;
  kpis: DashboardKpiItem[];
}
