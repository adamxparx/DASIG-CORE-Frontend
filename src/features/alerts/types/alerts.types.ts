export type AlertType = 'OVERDUE' | 'AT_RISK';
export type AlertSeverity = 'CRITICAL' | 'WARNING';

export interface AlertDetailResponse {
  id: number;
  submissionId?: number | null;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED';
  detectedAt: string;
  kpiDefinitionId: number;
  kpiName: string;
  committeeName?: string;
  organizationId?: number;
  organizationName?: string;
  alertType?: AlertType;
  severity?: AlertSeverity;
  deadline?: string;
  daysUntilDeadline?: number;
  reportingPeriod: string;
  periodContribution: number;
  cumulativeValue: number;
  scaledPeriodTarget: number;
  submissionDate?: string;
  achievementRate: number;
  performanceStatus: 'RED' | 'YELLOW' | 'GREEN';
  submissionType?: string;
  // Resolved on frontend from KPI definition
  targetValue?: number;
  threshold?: number;
  unit?: string;
  committeeId?: number;
}

export interface AlertResponse {
  id: number;
  submissionId?: number | null;
  kpiDefinitionId?: number;
  alertType?: AlertType;
  severity?: AlertSeverity;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED';
  detectedAt: string;
}
