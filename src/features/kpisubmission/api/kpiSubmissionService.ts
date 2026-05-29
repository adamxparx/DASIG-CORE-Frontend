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

  getSubmissions(params?: {
    kpiDefinitionId?: number;
    reportingPeriod?: string;
    submissionType?: 'INTERNAL' | 'FINAL';
  }): Promise<KpiSubmissionResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.kpiDefinitionId !== undefined) {
      searchParams.set('kpiDefinitionId', String(params.kpiDefinitionId));
    }
    if (params?.reportingPeriod) {
      searchParams.set('reportingPeriod', params.reportingPeriod);
    }
    if (params?.submissionType) {
      searchParams.set('submissionType', params.submissionType);
    }

    const query = searchParams.toString();
    return apiClient<KpiSubmissionResponse[]>(query ? `${SUBMISSION_ENDPOINT}?${query}` : SUBMISSION_ENDPOINT);
  },

  async downloadDocument(documentId: number): Promise<Blob> {
    const token = tokenStorage.get();
    const response = await fetch(`${SUBMISSION_ENDPOINT}/documents/${documentId}/download`, {
      headers: {
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new ApiError(bodyText || 'Failed to download submission document.', response.status);
    }

    return response.blob();
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
