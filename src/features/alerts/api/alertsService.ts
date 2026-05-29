import { apiClient } from '../../../lib/api/client';
import { kpiService } from '../../dashboard/shared/api/kpiService';
import type { AlertDetailResponse, AlertResponse } from '../types/alerts.types';

export const alertsService = {
  /**
   * Fetches raw alert summaries (id, submissionId, status, detectedAt).
   */
  getAllSummaries: (): Promise<AlertResponse[]> => {
    return apiClient<AlertResponse[]>('/api/alerts');
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
      };
    } catch {
      return alert;
    }
  },

  /**
   * Acknowledges an alert by its ID and merges KPI definition fields.
   */
  acknowledge: async (id: number): Promise<AlertDetailResponse> => {
    const alert = await apiClient<AlertDetailResponse>(`/api/alerts/${id}/acknowledge`, {
      method: 'PATCH',
    });
    try {
      const kpi = await kpiService.getKpiDefinitionById(alert.kpiDefinitionId);
      return {
        ...alert,
        targetValue: kpi.targetValue,
        threshold: kpi.threshold,
        unit: kpi.unit,
      };
    } catch {
      return alert;
    }
  },

  /**
   * Composes all alerts with their full details.
   * Fetches summaries first, loads all KPI definitions to create a quick lookup map,
   * then fetches and enriches each alert's details in parallel.
   * 
   * Note: This method is resilient. If an individual alert details fetch fails (e.g. throws a 401 
   * due to a missing KPI submission in the database), it will catch the error, log it, 
   * and filter it out so the rest of the Alerts page loads successfully.
   */
  getAllDetailed: async (): Promise<AlertDetailResponse[]> => {
    const summaries = await alertsService.getAllSummaries();
    if (!summaries || summaries.length === 0) {
      return [];
    }

    // Fetch all KPI definitions in bulk to build a quick lookup map
    const kpiMap: Record<number, any> = {};
    try {
      const kpis = await kpiService.getAllKpiDefinitions();
      kpis.forEach((kpi) => {
        kpiMap[kpi.id] = kpi;
      });
    } catch (e) {
      console.error('Failed to load KPI definitions in bulk', e);
    }

    // Retrieve details for all alerts in parallel, merge KPI properties, and handle failures gracefully
    const details = await Promise.all(
      summaries.map(async (summary) => {
        try {
          const detail = await apiClient<AlertDetailResponse>(`/api/alerts/${summary.id}`);
          const kpi = kpiMap[detail.kpiDefinitionId];
          if (kpi) {
            return {
              ...detail,
              targetValue: kpi.targetValue,
              threshold: kpi.threshold,
              unit: kpi.unit,
            };
          } else {
            // Fallback to individual retrieval if bulk lookup misses
            try {
              const singleKpi = await kpiService.getKpiDefinitionById(detail.kpiDefinitionId);
              return {
                ...detail,
                targetValue: singleKpi.targetValue,
                threshold: singleKpi.threshold,
                unit: singleKpi.unit,
              };
            } catch {
              return detail;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch details for alert ID: ${summary.id}`, e);
          return null; // Return null so we can filter it out
        }
      })
    );

    // Filter out any alerts that failed to load details
    const validDetails = details.filter((d): d is AlertDetailResponse => d !== null);

    // Sort by detectedAt desc (newest first)
    return validDetails.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  },
};
