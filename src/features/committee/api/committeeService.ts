import { apiClient } from '../../../lib/api/client';
import type {
  CommitteeResponse,
  CreateCommitteeRequest,
  UpdateCommitteeRequest,
} from '../types/committee.types';

const COMMITTEES_ENDPOINT = '/api/committees';

export const committeeService = {
  getAll(): Promise<CommitteeResponse[]> {
    return apiClient<CommitteeResponse[]>(COMMITTEES_ENDPOINT);
  },

  create(request: CreateCommitteeRequest): Promise<CommitteeResponse> {
    return apiClient<CommitteeResponse>(COMMITTEES_ENDPOINT, {
      method: 'POST',
      body: request,
    });
  },

  update(id: number, request: UpdateCommitteeRequest): Promise<CommitteeResponse> {
    return apiClient<CommitteeResponse>(`${COMMITTEES_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: request,
    });
  },

  deactivate(id: number): Promise<void> {
    return apiClient<void>(`${COMMITTEES_ENDPOINT}/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};
