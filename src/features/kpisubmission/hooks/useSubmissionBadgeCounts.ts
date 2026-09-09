import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { kpiSubmissionService, SUBMISSIONS_CHANGED_EVENT } from '../api/kpiSubmissionService';
import type { UserRole } from '../../dashboard/shared/types/dashboard.types';

export function useSubmissionBadgeCounts(role: UserRole) {
  const { pathname } = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadReviewCount, setUnreadReviewCount] = useState(0);

  const enabled = role === 'STAFF' || role === 'TBI_MANAGER';

  const refresh = useCallback(async () => {
    if (!enabled) {
      setPendingCount(0);
      setUnreadReviewCount(0);
      return;
    }

    try {
      const counts = await kpiSubmissionService.getBadgeCounts();
      setPendingCount(counts.pendingCount || 0);
      setUnreadReviewCount(counts.unreadReviewCount || 0);
    } catch {
      // Gracefully retain current counts or ignore network errors
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      void refresh();
    }, 30000);

    const handleUpdate = () => void refresh();
    window.addEventListener('focus', handleUpdate);
    window.addEventListener(SUBMISSIONS_CHANGED_EVENT, handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener(SUBMISSIONS_CHANGED_EVENT, handleUpdate);
    };
  }, [enabled, refresh]);

  return { pendingCount, unreadReviewCount, refresh };
}
