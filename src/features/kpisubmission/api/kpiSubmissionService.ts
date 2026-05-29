import { ApiError, apiClient } from '../../../lib/api/client';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import type {
  AssignableKpi,
  CreateKpiSubmissionRequest,
  KpiSubmissionResponse,
} from '../types/kpiSubmission.types';

const SUBMISSION_ENDPOINT = '/api/kpi-submissions';
const ASSIGNABLE_ENDPOINT = '/api/kpi-submissions/assignable';

export const kpiSubmissionService = {
  getAssignableKpis(): Promise<AssignableKpi[]> {
    return apiClient<AssignableKpi[]>(ASSIGNABLE_ENDPOINT);
  },

  getSubmissions(): Promise<KpiSubmissionResponse[]> {
    return apiClient<KpiSubmissionResponse[]>(SUBMISSION_ENDPOINT);
  },

  async createSubmission(
    request: CreateKpiSubmissionRequest,
    files: File[],
  ): Promise<KpiSubmissionResponse> {
    const token = tokenStorage.get();
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(SUBMISSION_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const bodyText = await response.text();
    if (!response.ok) {
      throw new ApiError(bodyText || 'Failed to submit KPI entry.', response.status);
    }

    try {
      return JSON.parse(bodyText) as KpiSubmissionResponse;
    } catch {
      throw new ApiError('Invalid response from KPI submission endpoint.', response.status);
    }
  },
};
