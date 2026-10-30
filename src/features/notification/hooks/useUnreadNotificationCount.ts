import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { notificationService } from '../api/notificationService';

export function useUnreadNotificationCount(enabled: boolean) {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    try {
      setUnreadCount(await notificationService.getUnreadCount());
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  return { unreadCount };
}
