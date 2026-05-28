export interface Organization {
  id: number;
  name: string;
}

export interface CreateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold: number; // Percentage, e.g. 80
  organizationId: number;
}

export interface UpdateKpiDefinitionRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // Format: YYYY-MM-DD
  threshold: number; // Percentage, e.g. 80
  organizationId: number;
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
}
