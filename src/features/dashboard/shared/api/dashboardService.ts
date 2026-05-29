import { apiClient } from '../../../../lib/api/client';
import type { DashboardApiResponse, KpiPeriodHistoryResponse } from '../types/dashboard.types';

const DASHBOARD_ENDPOINT = '/api/dashboard';

export const dashboardService = {
  getDashboard(): Promise<DashboardApiResponse> {
    return apiClient<DashboardApiResponse>(DASHBOARD_ENDPOINT);
  },

  getKpiPeriodHistory(kpiDefinitionId: number): Promise<KpiPeriodHistoryResponse> {
    return apiClient<KpiPeriodHistoryResponse>(`${DASHBOARD_ENDPOINT}/kpis/${kpiDefinitionId}/period-history`);
  },
};