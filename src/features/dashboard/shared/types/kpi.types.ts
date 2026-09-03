export type ReportingFrequency = 'ONE_TIME' | 'QUARTERLY' | 'ANNUAL' | 'MONTHLY';

export interface Organization {
  id: number;
  name: string;
  status?: string;
}

export interface Committee {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  organizationIds?: number[];
}

export interface CreateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold?: number; // Optional: defaults to 100 on backend
  committeeId: number;
  reportingFrequency?: ReportingFrequency; // Optional: defaults to ONE_TIME on backend
}

export interface UpdateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold?: number; // Optional: defaults to 100 on backend
  reportingFrequency?: ReportingFrequency; // Optional: defaults to ONE_TIME on backend
}

export interface KpiDefinitionResponse {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string;
  threshold: number;
  committeeId: number;
  committeeName: string;
  reportingFrequency: ReportingFrequency;
}
