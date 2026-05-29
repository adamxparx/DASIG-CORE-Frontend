import { getApiUrl } from '../../../config/api';
import { apiClient } from '../../../lib/api/client';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import type { GenerateReportRequest, ReportResponse } from '../types/report.types';

export const reportService = {
  /**
   * Triggers the generation of an AI-powered KPI Performance Report narrative.
   */
  generateReport: (request: GenerateReportRequest): Promise<ReportResponse> => {
    return apiClient<ReportResponse>('/api/reports/generate', {
      method: 'POST',
      body: request,
    });
  },

  /**
   * Retrieves a previously generated report by its ID.
   */
  getById: (id: number): Promise<ReportResponse> => {
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
  exportPdfBlob: async (id: number): Promise<Blob> => {
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
