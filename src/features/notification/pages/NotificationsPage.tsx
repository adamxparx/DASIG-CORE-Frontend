import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { committeeAlertsService } from '../../alerts/api/committeeAlertsService';
import ExplainOverdueDialog from '../../alerts/components/ExplainOverdueDialog';
import type { CommitteeOverdueAlert } from '../../alerts/types/alerts.types';
import DashboardHeader from '../../dashboard/shared/components/DashboardHeader';
import { notificationService } from '../api/notificationService';
import NotificationsList from '../components/NotificationsList';
import type { NotificationResponse } from '../types/notification.types';
import { isUnreadNotification, sortNotifications } from '../utils/notificationDisplay';

interface NotificationsPageProps {
  /** Committee Lead only: show "Add explanation" on Overdue notifications (UC-4.4). */
  canExplainOverdue?: boolean;
}

const NotificationsPage = ({ canExplainOverdue = false }: NotificationsPageProps) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [overdueByAlertId, setOverdueByAlertId] = useState<Record<number, CommitteeOverdueAlert>>({});
  const [explaining, setExplaining] = useState<CommitteeOverdueAlert | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Explanation status for each Overdue alert, so its notification can show "Add explanation" or "Explained"
  const loadOverdueAlerts = useCallback(() => {
    if (!canExplainOverdue) {
      return;
    }
    committeeAlertsService
      .getOverdue()
      .then((items) => setOverdueByAlertId(Object.fromEntries(items.map((item) => [item.alertId, item]))))
      .catch(() => setOverdueByAlertId({}));
  }, [canExplainOverdue]);

  const loadNotifications = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load notifications.');
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadOverdueAlerts();
  }, [loadOverdueAlerts]);

  const handleExplanationSubmitted = (updated: CommitteeOverdueAlert) => {
    setOverdueByAlertId((prev) => ({ ...prev, [updated.alertId]: updated }));
    setExplaining(null);
    setSuccessMessage('Explanation submitted. The Admin can now see it on the alert.');
  };

  const sortedNotifications = useMemo(
    () => sortNotifications(notifications),
    [notifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => isUnreadNotification(item.status)).length,
    [notifications],
  );

  const handleSelect = async (notification: NotificationResponse) => {
    if (!isUnreadNotification(notification.status)) {
      return;
    }

    setMarkingReadId(notification.id);
    setActionError(null);

    try {
      const updated = await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                status: updated.status,
                message: updated.message,
              }
            : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Unable to mark notification as read.',
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
      >
        <Box>
          <DashboardHeader
            title="Notifications"
            subtitle="KPI deadline reminders and alerts for your organization"
          />
          {!isLoading && unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              color="primary"
              sx={{ mt: 1.5, fontWeight: 600 }}
            />
          )}
        </Box>

        <Tooltip title="Refresh notifications">
          <span>
            <IconButton
              onClick={() => {
                void loadNotifications(true);
                loadOverdueAlerts();
              }}
              disabled={isLoading || isRefreshing}
              aria-label="Refresh notifications"
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              <RefreshOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Divider />

      {error && <Alert severity="error">{error}</Alert>}

      <NotificationsList
        notifications={sortedNotifications}
        isLoading={isLoading}
        markingReadId={markingReadId}
        onSelect={handleSelect}
        overdueByAlertId={canExplainOverdue ? overdueByAlertId : undefined}
        onExplain={setExplaining}
      />

      <ExplainOverdueDialog
        key={explaining?.alertId ?? 'none'}
        alert={explaining}
        onClose={() => setExplaining(null)}
        onSubmitted={handleExplanationSubmitted}
      />

      <Typography variant="caption" color="text.secondary">
        Click an unread notification to mark it as read.
      </Typography>

      <Snackbar
        open={!!actionError}
        autoHideDuration={4000}
        onClose={() => setActionError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setActionError(null)} sx={{ borderRadius: 2 }}>
          {actionError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ borderRadius: 2 }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default NotificationsPage;
