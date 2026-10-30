import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ALERTS_CHANGED_EVENT, alertsService } from '../api/alertsService';

export function useUnacknowledgedAlertCount(enabled: boolean) {
  const { pathname } = useLocation();
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnacknowledgedCount(0);
      return;
    }

    try {
      setUnacknowledgedCount(await alertsService.getUnacknowledgedCount());
    } catch {
      setUnacknowledgedCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleChange = () => void refresh();
    window.addEventListener(ALERTS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(ALERTS_CHANGED_EVENT, handleChange);
  }, [enabled, refresh]);

  return { unacknowledgedCount };
}
