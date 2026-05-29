export interface AlertDetailResponse {
  id: number;
  submissionId: number;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED';
  detectedAt: string;
  kpiDefinitionId: number;
  kpiName: string;
  organizationId: number;
  organizationName: string;
  reportingPeriod: string;
  periodContribution: number;
  cumulativeValue: number;
  scaledPeriodTarget: number;
  submissionDate: string;
  achievementRate: number;
  performanceStatus: 'RED' | 'YELLOW' | 'GREEN';
  submissionType: string;
  // Resolved on frontend from KPI definition
  targetValue?: number;
  threshold?: number;
  unit?: string;
}

export interface AlertResponse {
  id: number;
  submissionId: number;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED';
  detectedAt: string;
}
