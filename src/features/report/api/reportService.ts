import { getApiUrl } from '../../../config/api';
import { apiClient } from '../../../lib/api/client';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import type { GenerateOrgReportRequest, GenerateKpiReportRequest, ReportResponse } from '../types/report.types';

export const reportService = {
  /**
   * Triggers the generation of an AI-powered Organizational Performance Report narrative.
   */
  generateOrgReport: (request: GenerateOrgReportRequest): Promise<ReportResponse> => {
    return apiClient<ReportResponse>('/api/reports/generate/organization', {
      method: 'POST',
      body: request,
    });
  },

  /**
   * Triggers the generation of an AI-powered KPI Performance Report narrative.
   */
  generateKpiReport: (request: GenerateKpiReportRequest): Promise<ReportResponse> => {
    return apiClient<ReportResponse>('/api/reports/generate/kpi', {
      method: 'POST',
      body: request,
    });
  },

  /**
   * Retrieves a previously generated report by its ID.
   */
  getById: (id: string): Promise<ReportResponse> => {
    return apiClient<ReportResponse>(`/api/reports/${id}`);
  },

  /**
   * Retrieves all historical reports generated for a specific incubator organization.
   */
  getByOrganization: (organizationId: number): Promise<ReportResponse[]> => {
    return apiClient<ReportResponse[]>(`/api/reports/organization/${organizationId}`);
  },

  /**
   * Downloads a PDF export of a report by its ID.
   * Fetches the file using the authorized header and returns it as a binary Blob.
   */
  exportPdfBlob: async (id: string): Promise<Blob> => {
    const token = tokenStorage.get();
    const response = await fetch(getApiUrl(`/api/reports/${id}/export`), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Unable to export performance report PDF.');
    }

    return response.blob();
  },
};

