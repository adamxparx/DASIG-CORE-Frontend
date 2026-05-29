import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { NotificationResponse } from '../types/notification.types';
import {
  formatNotificationDate,
  formatNotificationDateTime,
  formatNotificationTypeLabel,
  isUnreadNotification,
} from '../utils/notificationDisplay';

interface NotificationsListProps {
  notifications: NotificationResponse[];
  isLoading: boolean;
  markingReadId: number | null;
  onSelect: (notification: NotificationResponse) => void;
}

const NotificationsList = ({
  notifications,
  isLoading,
  markingReadId,
  onSelect,
}: NotificationsListProps) => {
  if (isLoading) {
    return (
      <Stack sx={{ py: 8, alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (notifications.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          py: 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          You have no notifications yet.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          If an admin just saved a matching deadline, click Refresh above. Alerts are scoped to your
          assigned organization.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.5}>
      {notifications.map((notification) => {
        const unread = isUnreadNotification(notification.status);
        const isMarking = markingReadId === notification.id;

        return (
          <Paper
            key={notification.id}
            elevation={0}
            onClick={() => {
              if (!isMarking) {
                onSelect(notification);
              }
            }}
            sx={{
              border: 1,
              borderColor: unread ? 'primary.light' : 'divider',
              borderRadius: 2,
              p: 2.5,
              cursor: unread && !isMarking ? 'pointer' : 'default',
              bgcolor: unread ? 'rgba(66, 110, 240, 0.06)' : 'background.paper',
              opacity: isMarking ? 0.7 : 1,
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': unread && !isMarking
                ? {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  }
                : undefined,
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: unread ? 700 : 600,
                        color: 'text.primary',
                      }}
                    >
                      {notification.kpiName}
                    </Typography>
                    {unread && (
                      <Chip label="New" size="small" color="primary" sx={{ fontWeight: 600, height: 22 }} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {notification.message}
                  </Typography>
                </Box>

                <Chip
                  label={formatNotificationTypeLabel(notification.notificationType)}
                  size="small"
                  color={notification.notificationType === 'TWO_DAYS_BEFORE' ? 'warning' : 'info'}
                  variant="outlined"
                  sx={{ fontWeight: 600, flexShrink: 0 }}
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ color: 'text.secondary' }}
              >
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">
                    Deadline: {formatNotificationDate(notification.deadline)}
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Received: {formatNotificationDateTime(notification.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default NotificationsList;
