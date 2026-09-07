export interface ReportCitation {
  submissionId: number;
  kpiName: string;
  organizationName: string;
  submittedValue: number;
  targetValue: number;
  submissionDate: string; // ISO date format YYYY-MM-DD
}

export interface ReportSection {
  heading: string;
  text: string;
  sources: ReportCitation[];
}

export interface ReportResponse {
  id: string;
  committeeId: number;
  committeeName: string | null;
  reportType: 'COMMITTEE' | 'KPI';
  kpiDefinitionId: number | null;
  kpiName: string | null;
  periodFrom: string; // ISO date format YYYY-MM-DD
  periodTo: string; // ISO date format YYYY-MM-DD
  narrativeText: string;
  status: 'GENERATED' | 'FAILED';
  generatedAt: string; // ISO date time
  // Null/empty for reports generated before per-section citations were introduced —
  // fall back to rendering narrativeText as flat markdown in that case.
  sections: ReportSection[] | null;
}

export interface GenerateCommitteeReportRequest {
  committeeId: number;
  periodFrom: string; // Format: YYYY-MM-DD
  periodTo: string; // Format: YYYY-MM-DD
}

export interface GenerateKpiReportRequest {
  kpiDefinitionId: number;
  periodFrom: string; // Format: YYYY-MM-DD
  periodTo: string; // Format: YYYY-MM-DD
}

