import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { notificationService } from '../api/notificationService';
import { isUnreadNotification } from '../utils/notificationDisplay';

export function useUnreadNotificationCount(enabled: boolean) {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await notificationService.getAll();
      setUnreadCount(data.filter((item) => isUnreadNotification(item.status)).length);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, refresh]);

  return { unreadCount, refresh };
}
