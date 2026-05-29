export interface ReportResponse {
  id: string;
  organizationId: number;
  periodFrom: string; // ISO date format YYYY-MM-DD
  periodTo: string; // ISO date format YYYY-MM-DD
  narrativeText: string;
  status: 'GENERATED' | 'FAILED';
  generatedAt: string; // ISO date time
}

export interface GenerateOrgReportRequest {
  organizationId: number;
  periodFrom: string; // Format: YYYY-MM-DD
  periodTo: string; // Format: YYYY-MM-DD
}

export interface GenerateKpiReportRequest {
  kpiDefinitionId: number;
  periodFrom: string; // Format: YYYY-MM-DD
  periodTo: string; // Format: YYYY-MM-DD
}

