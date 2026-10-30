import { apiClient, apiGetCached, clearApiCache } from '../../../lib/api/client';
import { kpiService } from '../../dashboard/shared/api/kpiService';
import type { AlertDetailResponse } from '../types/alerts.types';

/** Fired whenever an alert's acknowledgment state changes, so listeners (e.g. the sidebar badge) can refresh. */
export const ALERTS_CHANGED_EVENT = 'alerts:changed';

export const alertsService = {
  /** Number of unacknowledged alerts (sidebar badge). Cached briefly so both sidebars share one request. */
  getUnacknowledgedCount: (): Promise<number> => {
    return apiGetCached<number>('/api/alerts/unacknowledged-count', 5_000);
  },

  /**
   * Fetches detailed information for a single alert and merges KPI definition fields.
   */
  getById: async (id: number): Promise<AlertDetailResponse> => {
    const alert = await apiClient<AlertDetailResponse>(`/api/alerts/${id}`);
    try {
      const kpi = await kpiService.getKpiDefinitionById(alert.kpiDefinitionId);
      return {
        ...alert,
        targetValue: kpi.targetValue,
        threshold: kpi.threshold,
        unit: kpi.unit,
        committeeId: kpi.committeeId,
        committeeName: kpi.committeeName,
      };
    } catch {
      return alert;
    }
  },

  /**
   * Acknowledges an alert with the Admin's remark (required, max 500 characters) and merges KPI definition fields.
   */
  acknowledge: async (id: number, remark: string): Promise<AlertDetailResponse> => {
    const alert = await apiClient<AlertDetailResponse>(`/api/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: { remark },
    });
    window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
    try {
      const kpi = await kpiService.getKpiDefinitionById(alert.kpiDefinitionId);
      return {
        ...alert,
        targetValue: kpi.targetValue,
        threshold: kpi.threshold,
        unit: kpi.unit,
        committeeId: kpi.committeeId,
        committeeName: kpi.committeeName,
      };
    } catch {
      return alert;
    }
  },

  /**
   * Loads all alerts with their details in one request, plus the KPI definitions
   * (target, unit, committee) in parallel, then merges them. Newest first.
   */
  getAllDetailed: async (): Promise<AlertDetailResponse[]> => {
    const [details, kpis] = await Promise.all([
      apiClient<AlertDetailResponse[]>('/api/alerts/details'),
      kpiService.getAllKpiDefinitions().catch(() => []),
    ]);
    // Opening the Alerts page re-checks every KPI, so let the sidebar badge refresh too
    clearApiCache();
    window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));

    const kpiById = new Map(kpis.map((kpi) => [kpi.id, kpi]));
    return details
      .map((detail) => {
        const kpi = kpiById.get(detail.kpiDefinitionId);
        return kpi
          ? {
              ...detail,
              targetValue: kpi.targetValue,
              threshold: kpi.threshold,
              unit: kpi.unit,
              committeeId: kpi.committeeId,
              committeeName: kpi.committeeName,
            }
          : detail;
      })
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  },
};
