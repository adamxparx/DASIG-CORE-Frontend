import { apiClient } from '../../../../lib/api/client';
import type { DashboardApiResponse, KpiPeriodHistoryResponse } from '../types/dashboard.types';

const DASHBOARD_ENDPOINT = '/api/dashboard';

export const dashboardService = {
  getDashboard(committeeId?: number): Promise<DashboardApiResponse> {
    const query = committeeId != null ? `?committeeId=${committeeId}` : '';
    return apiClient<DashboardApiResponse>(`${DASHBOARD_ENDPOINT}${query}`);
  },

  getKpiPeriodHistory(kpiDefinitionId: number): Promise<KpiPeriodHistoryResponse> {
    return apiClient<KpiPeriodHistoryResponse>(`${DASHBOARD_ENDPOINT}/kpis/${kpiDefinitionId}/period-history`);
  },
};