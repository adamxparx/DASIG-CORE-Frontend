import { apiClient } from '../../../lib/api/client';
import type {
  CreateOrganizationRequest,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from '../types/organization.types';

const ORGANIZATIONS_ENDPOINT = '/api/organizations';

export const organizationService = {
  getAll(): Promise<OrganizationResponse[]> {
    return apiClient<OrganizationResponse[]>(ORGANIZATIONS_ENDPOINT);
  },

  create(request: CreateOrganizationRequest): Promise<OrganizationResponse> {
    return apiClient<OrganizationResponse>(ORGANIZATIONS_ENDPOINT, {
      method: 'POST',
      body: request,
    });
  },

  update(id: number, request: UpdateOrganizationRequest): Promise<OrganizationResponse> {
    return apiClient<OrganizationResponse>(`${ORGANIZATIONS_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: request,
    });
  },

  deactivate(id: number): Promise<void> {
    return apiClient<void>(`${ORGANIZATIONS_ENDPOINT}/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};
