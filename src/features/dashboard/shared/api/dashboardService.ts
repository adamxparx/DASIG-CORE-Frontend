import { apiClient } from '../../../../lib/api/client';
import type { DashboardApiResponse } from '../types/dashboard.types';

const DASHBOARD_ENDPOINT = '/api/dashboard';

export const dashboardService = {
  getDashboard(): Promise<DashboardApiResponse> {
    return apiClient<DashboardApiResponse>(DASHBOARD_ENDPOINT);
  },
};
