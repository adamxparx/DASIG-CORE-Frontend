import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { tokenStorage } from '../features/auth/utils/tokenStorage'; // Adjust relative import path to your tokenStorage file

class FatalError extends Error {}

interface RealtimeUpdatePayload {
  eventType?: string;
  submissionId?: number;
  submittedValue?: number;
  timestamp?: number;

}

interface RealtimeKpiDefinitionPayload {
  eventType?: string;
  kpiDefinitionId?: number;
  organizationId?: number;
  timestamp?: number;
}

interface UseRealtimeOptions {
  onKpiUpdate?: (payload: RealtimeUpdatePayload) => void;
  onKpiDefinitionChange?: (payload: RealtimeKpiDefinitionPayload) => void;
}

export function useRealtimeUpdates({ onKpiUpdate, onKpiDefinitionChange }: UseRealtimeOptions) {
  useEffect(() => {
    // 1. Retrieve the token using your project's storage helper
    const token = tokenStorage.get();

    // If no token exists yet (user logged out or before login), exit cleanly
    if (!token) {
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const ctrl = new AbortController();

    fetchEventSource(`${baseUrl}/realtime/stream`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: ctrl.signal,
      async onopen(response) {
        if (response.ok) {
          console.log('[SSE] Realtime updates stream connected.');
          return;
        }

        // Stop retry loop immediately on 401 or 403
        if (response.status === 401 || response.status === 403) {
          throw new FatalError(`Authentication failed with status ${response.status}`);
        }

        throw new Error(`Server returned status ${response.status}`);
      },
      // Inside src/hooks/useRealtimeUpdates.ts

        onmessage(event) {
        // Only handle KPI_UPDATE events
        if (event.event === 'KPI_UPDATE' && event.data) {
            try {
            const data: RealtimeUpdatePayload = JSON.parse(event.data);
            
            // Ignore initial handshake/connection events
            if (data && data.submissionId) {
                onKpiUpdate?.(data);
            }
            } catch (err) {
            console.error('[SSE] Failed to parse message:', err);
            }
        }

        // Handle KPI definition created/updated/deleted
        if (event.event === 'KPI_DEFINITION_UPDATE' && event.data) {
            try {
            const data: RealtimeKpiDefinitionPayload = JSON.parse(event.data);

            if (data && data.kpiDefinitionId) {
                onKpiDefinitionChange?.(data);
            }
            } catch (err) {
            console.error('[SSE] Failed to parse message:', err);
            }
        }
        },onerror(err) {
        if (err instanceof FatalError) {
          console.error('[SSE] Auth error, stream aborted:', err.message);
          ctrl.abort();
          throw err;
        }
      },
    });

    return () => {
      ctrl.abort();
    };
  }, [onKpiUpdate, onKpiDefinitionChange]);
}