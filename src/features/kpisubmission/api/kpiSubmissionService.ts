import { getApiUrl } from '../../../config/api';
import { ApiError, apiClient } from '../../../lib/api/client';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import type {
  AssignableKpi,
  CreateKpiSubmissionRequest,
  KpiSubmissionBadgeCountsResponse,
  KpiSubmissionResponse,
  ReviewKpiSubmissionRequest,
  SubmissionReviewStatus,
} from '../types/kpiSubmission.types';
 
const SUBMISSION_ENDPOINT = '/api/kpi-submissions';
const ASSIGNABLE_ENDPOINT = '/api/kpi-submissions/assignable';

export const SUBMISSIONS_CHANGED_EVENT = 'submissions:changed';
 
export const kpiSubmissionService = {
  getAssignableKpis(): Promise<AssignableKpi[]> {
    return apiClient<AssignableKpi[]>(ASSIGNABLE_ENDPOINT);
  },
 
  getSubmissions(params?: {
    kpiDefinitionId?: number;
    reportingPeriod?: string;
    submissionType?: 'INTERNAL' | 'FINAL';
    reviewStatus?: SubmissionReviewStatus;
    committeeId?: number;
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
    if (params?.reviewStatus) {
      searchParams.set('reviewStatus', params.reviewStatus);
    }
    if (params?.committeeId !== undefined) {
      searchParams.set('committeeId', String(params.committeeId));
    }
 
    const query = searchParams.toString();
    return apiClient<KpiSubmissionResponse[]>(query ? `${SUBMISSION_ENDPOINT}?${query}` : SUBMISSION_ENDPOINT);
  },

  async reviewSubmission(
    submissionId: number,
    request: ReviewKpiSubmissionRequest,
  ): Promise<KpiSubmissionResponse> {
    const response = await apiClient<KpiSubmissionResponse>(`${SUBMISSION_ENDPOINT}/${submissionId}/review`, {
      method: 'PATCH',
      body: request,
    });
    window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
    return response;
  },

  getBadgeCounts(): Promise<KpiSubmissionBadgeCountsResponse> {
    return apiClient<KpiSubmissionBadgeCountsResponse>(`${SUBMISSION_ENDPOINT}/badge-counts`);
  },

  getSubmissionById(submissionId: number): Promise<KpiSubmissionResponse> {
    return apiClient<KpiSubmissionResponse>(`${SUBMISSION_ENDPOINT}/${submissionId}`);
  },

  async downloadSubmissionDocumentAsAdmin(submissionId: number, documentId: number): Promise<Blob> {
    const token = tokenStorage.get();
    const response = await fetch(
      getApiUrl(`${SUBMISSION_ENDPOINT}/${submissionId}/documents/${documentId}/download`),
      {
        headers: {
          Accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const bodyText = await response.text();
      throw new ApiError(bodyText || 'Failed to download submission document.', response.status);
    }

    return response.blob();
  },

  async markSubmissionsAsViewed(submissionIds?: number[]): Promise<void> {
    await apiClient<void>(`${SUBMISSION_ENDPOINT}/mark-viewed`, {
      method: 'PATCH',
      body: submissionIds && submissionIds.length > 0 ? { submissionIds } : {},
    });
    window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
  },
 
  async downloadDocument(documentId: number): Promise<Blob> {
    const token = tokenStorage.get();
    const response = await fetch(getApiUrl(`${SUBMISSION_ENDPOINT}/documents/${documentId}/download`), {
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
 
    const response = await fetch(getApiUrl(SUBMISSION_ENDPOINT), {
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
      const created = JSON.parse(bodyText) as KpiSubmissionResponse;
      window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
      return created;
    } catch {
      throw new ApiError('Invalid response from KPI submission endpoint.', response.status);
    }
  },
};