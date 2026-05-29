export interface ReportResponse {
  id: number;
  organizationId: number;
  periodFrom: string; // ISO date format YYYY-MM-DD
  periodTo: string; // ISO date format YYYY-MM-DD
  narrativeText: string;
  status: 'GENERATED' | 'FAILED';
  generatedAt: string; // ISO date time
}

export interface GenerateReportRequest {
  organizationId: number;
  periodFrom: string; // Format: YYYY-MM-DD
  periodTo: string; // Format: YYYY-MM-DD
}
