import type { KpiSubmissionResponse } from '../../types/kpiSubmission.types';

type SubmissionRole = 'STAFF' | 'TBI_MANAGER';

export const getKpiSubmissionSuccessMessage = (
  role: SubmissionRole,
  response: KpiSubmissionResponse
) => {
  if (role === 'STAFF' || response.reviewStatus === 'PENDING') {
    return 'KPI submitted successfully as pending for approval.';
  }

  if (response.submissionType === 'FINAL') {
    return 'KPI submitted successfully as an official final submission.';
  }

  return 'KPI submitted successfully.';
};
