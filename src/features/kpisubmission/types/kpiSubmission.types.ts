export interface AssignableKpi {
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

export interface CreateKpiSubmissionRequest {
  kpiDefinitionId: number;
  reportingPeriod: string;
  submittedValue: number;
  submissionDate: string;
  notes?: string;
}

export interface SubmissionDocumentResponse {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface KpiSubmissionResponse {
  id: number;
  kpiDefinitionId: number;
  kpiName: string;
  reportingPeriod: string;
  submittedValue: number;
  submissionDate: string;
  notes?: string;
  submissionType: 'INTERNAL' | 'FINAL';
  achievementRate: number;
  performanceStatus: string;
  documents: SubmissionDocumentResponse[];
  createdAt: string;
}
