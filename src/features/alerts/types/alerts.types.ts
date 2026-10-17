export type AlertType = 'OVERDUE' | 'AT_RISK';
export type AlertSeverity = 'CRITICAL' | 'WARNING';
export type AlertStatus = 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED';
/** Only set for Overdue alerts. */
export type ExplanationStatus = 'Awaiting explanation' | 'Explained';

export interface AlertDetailResponse {
  id: number;
  submissionId?: number | null;
  status: AlertStatus;
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
  performanceStatus: 'OVERDUE' | 'AT_RISK' | 'ON_TRACK' | 'COMPLETED';
  submissionType?: string;
  /** Progress the KPI should have reached by today (pace rule). */
  expectedByNow?: number;
  // Admin remark (set when acknowledged)
  adminRemark?: string | null;
  remarkedByName?: string | null;
  remarkedAt?: string | null;
  // Automatic resolution
  resolvedAt?: string | null;
  resolutionReason?: string | null;
  // Committee Lead's explanation (Overdue alerts only)
  explanationStatus?: ExplanationStatus | null;
  explanation?: string | null;
  explainedByName?: string | null;
  explainedAt?: string | null;
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
  status: AlertStatus;
  detectedAt: string;
  resolvedAt?: string | null;
  resolutionReason?: string | null;
  explanationStatus?: ExplanationStatus | null;
}

/** An Overdue alert as seen by the Committee Lead (UC-4.4). */
export interface CommitteeOverdueAlert {
  alertId: number;
  kpiDefinitionId: number;
  kpiName: string;
  committeeName?: string | null;
  deadline?: string | null;
  alertStatus: AlertStatus;
  detectedAt: string;
  explanationStatus: ExplanationStatus;
  explanation?: string | null;
  explainedAt?: string | null;
}
