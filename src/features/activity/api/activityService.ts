import { getApiUrl } from '../../../config/api';
import { tokenStorage } from '../../auth/utils/tokenStorage';

export type ActivityAction =
  | 'SIGNED_IN'
  | 'OPEN_DASHBOARD'
  | 'OPEN_CREATE_KPI'
  | 'OPEN_KPI_DETAIL'
  | 'OPEN_ALERTS'
  | 'OPEN_REPORT_GENERATION'
  | 'OPEN_SUBMIT_KPI'
  | 'OPEN_SUBMISSION_HISTORY'
  | 'OPEN_SUBMISSION_DETAIL'
  | 'OPEN_NOTIFICATIONS'
  | 'OPEN_NOTIFICATION';

/**
 * Records a page event for the final user validation (only saved when the backend has
 * APP_ACTIVITY_LOG=true). Runs in the background; errors are ignored so the user is never blocked.
 * The path defaults to the current page address, so it shows which KPI or page was opened.
 */
export function logActivity(action: ActivityAction, path: string = window.location.pathname): void {
  const token = tokenStorage.get();
  if (!token) return;

  fetch(getApiUrl('/api/activity'), {
    method: 'POST',
    credentials: 'omit',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, path }),
  }).catch(() => undefined);
}
