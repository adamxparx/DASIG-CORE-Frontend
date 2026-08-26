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
  reportingFrequency: 'ONE_TIME' | 'QUARTERLY' | 'ANNUAL' | 'MONTHLY';
}

export interface CreateKpiSubmissionRequest {
  kpiDefinitionId: number;
  reportingPeriod: string;
  submittedValue: number;
  submissionDate: string;
  notes?: string;
}

export type SubmissionReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewKpiSubmissionRequest {
  reviewStatus: Exclude<SubmissionReviewStatus, 'PENDING'>;
  rejectionReason?: string;
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
  submittedByName?: string;
  submittedByRole?: string;
  reportingPeriod: string;
  submittedValue: number;
  submissionDate: string;
  notes?: string;
  submissionType: 'INTERNAL' | 'FINAL';
  achievementRate: number;
  performanceStatus: string;
  reviewStatus?: SubmissionReviewStatus;
  rejectionReason?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  sourceSubmissionId?: number;
  documents: SubmissionDocumentResponse[];
  createdAt: string;
}
