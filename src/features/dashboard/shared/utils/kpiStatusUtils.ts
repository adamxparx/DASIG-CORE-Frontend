import type { DashboardStatus } from '../types/dashboard.types';

/**
 * Computes the frontend-derived KPI status based on goal completion,
 * deadline, and time-elapsed pacing.
 *
 * Rules (Option 1 — Goal & Deadline-Based):
 *  - COMPLETED  → submittedValue >= targetValue (goal fully reached)
 *  - DELAYED    → deadline has passed AND target not yet reached
 *  - AT_RISK    → deadline is within `atRiskDays` AND progress < `atRiskProgressRatio`
 *  - ON_TRACK   → everything else (actively progressing with time remaining)
 *
 * This overrides the backend-computed status, which used strict periodic
 * thresholds that don't apply to the new "Submit Anytime" workflow.
 */
export const computeKpiStatus = (
  submittedValue: number,
  targetValue: number,
  deadline: string,
  atRiskDays = 60,
  atRiskProgressRatio = 0.5
): DashboardStatus => {
  const overallTarget = targetValue;

  // COMPLETED: target reached or exceeded
  if (overallTarget > 0 && submittedValue >= overallTarget) {
    return 'COMPLETED';
  }

  // Parse deadline in local time to avoid UTC-offset shifting
  const [year, month, day] = deadline.split('-').map(Number);
  const deadlineDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / msPerDay);

  // DELAYED: deadline has passed and target not reached
  if (daysUntilDeadline < 0) {
    return 'DELAYED';
  }

  // AT_RISK: deadline is approaching AND progress is significantly below half the target
  const progressRatio = overallTarget > 0 ? submittedValue / overallTarget : 0;
  if (daysUntilDeadline <= atRiskDays && progressRatio < atRiskProgressRatio) {
    return 'AT_RISK';
  }

  // ON_TRACK: actively progressing with time remaining
  return 'ON_TRACK';
};
