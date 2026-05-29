import { apiClient } from '../../../../lib/api/client';
import type {
  CreateKpiDefinitionRequest,
  KpiDefinitionResponse,
  Organization,
  UpdateKpiDefinitionRequest,
} from '../types/kpi.types';

const KPI_ENDPOINT = '/api/kpi-definitions';
const ORGANIZATIONS_ENDPOINT = '/api/organizations';

const DEFAULT_ORGANIZATIONS: Organization[] = [
  { id: 1, name: 'Organization A' },
  { id: 2, name: 'Organization B' },
  { id: 3, name: 'Organization C' },
];

export const kpiService = {
  createKpiDefinition(request: CreateKpiDefinitionRequest): Promise<KpiDefinitionResponse> {
    return apiClient<KpiDefinitionResponse>(KPI_ENDPOINT, {
      method: 'POST',
      body: request,
    });
  },

  updateKpiDefinition(id: number, request: UpdateKpiDefinitionRequest): Promise<KpiDefinitionResponse> {
    return apiClient<KpiDefinitionResponse>(`${KPI_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: request,
    });
  },

  deleteKpiDefinition(id: number): Promise<void> {
    return apiClient<void>(`${KPI_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  },

  getAllKpiDefinitions(): Promise<KpiDefinitionResponse[]> {
    return apiClient<KpiDefinitionResponse[]>(KPI_ENDPOINT);
  },

  getKpiDefinitionById(id: number): Promise<KpiDefinitionResponse> {
    return apiClient<KpiDefinitionResponse>(`${KPI_ENDPOINT}/${id}`);
  },

  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiClient<Organization[]>(ORGANIZATIONS_ENDPOINT);
      if (Array.isArray(response)) {
        return response;
      }
      return DEFAULT_ORGANIZATIONS;
    } catch {
      // Fallback in case /api/organizations is not implemented
      return DEFAULT_ORGANIZATIONS;
    }
  },
};
