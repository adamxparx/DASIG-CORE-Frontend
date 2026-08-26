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
  threshold: number; // Percentage, e.g. 80
  committeeId: number;
  reportingFrequency: ReportingFrequency;
}

export interface UpdateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold: number; // Percentage, e.g. 80
  reportingFrequency: ReportingFrequency;
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
