import { apiClient, apiGetCached } from '../../../../lib/api/client';
import type { DashboardApiResponse, KpiPeriodHistoryResponse } from '../types/dashboard.types';

const DASHBOARD_ENDPOINT = '/api/dashboard';

export const dashboardService = {
  // Cached for 30 seconds: the KPI pages and the header ask for the same dashboard
  getDashboard(committeeId?: number): Promise<DashboardApiResponse> {
    const query = committeeId != null ? `?committeeId=${committeeId}` : '';
    return apiGetCached<DashboardApiResponse>(`${DASHBOARD_ENDPOINT}${query}`);
  },

  getKpiPeriodHistory(kpiDefinitionId: number, committeeId?: number): Promise<KpiPeriodHistoryResponse> {
    const query = committeeId != null ? `?committeeId=${committeeId}` : '';
    return apiClient<KpiPeriodHistoryResponse>(`${DASHBOARD_ENDPOINT}/kpis/${kpiDefinitionId}/period-history${query}`);
  },
};