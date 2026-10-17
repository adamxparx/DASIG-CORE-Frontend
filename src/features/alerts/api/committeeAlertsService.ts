import { apiClient } from '../../../lib/api/client';
import type { CommitteeOverdueAlert } from '../types/alerts.types';

/** Committee Lead endpoints for Overdue alerts and their explanations (UC-4.4). */
export const committeeAlertsService = {
  /** Overdue alerts for the KPIs of the Committee Lead's committees, newest first. */
  getOverdue: (): Promise<CommitteeOverdueAlert[]> => {
    return apiClient<CommitteeOverdueAlert[]>('/api/committee-alerts/overdue');
  },

  /** Submits the one explanation for an Overdue alert (max 2,000 characters). */
  submitExplanation: (alertId: number, explanation: string): Promise<CommitteeOverdueAlert> => {
    return apiClient<CommitteeOverdueAlert>(`/api/committee-alerts/${alertId}/explanation`, {
      method: 'POST',
      body: { explanation },
    });
  },
};
