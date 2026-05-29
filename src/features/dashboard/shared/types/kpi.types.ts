export type ReportingFrequency = 'ONE_TIME' | 'QUARTERLY' | 'ANNUAL' | 'MONTHLY';

export interface Organization {
  id: number;
  name: string;
  status?: string;
}

export interface CreateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold: number; // Percentage, e.g. 80
  organizationId: number;
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
  organizationId: number;
  organizationName: string;
  reportingFrequency: ReportingFrequency;
}
