import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { CommitteeOverdueAlert } from '../../alerts/types/alerts.types';
import type { NotificationResponse, NotificationType } from '../types/notification.types';
import {
  formatNotificationDate,
  formatNotificationDateTime,
  formatNotificationTypeLabel,
  getNotificationTypeColor,
  isUnreadNotification,
} from '../utils/notificationDisplay';

/** Accent for At Risk and Overdue notifications (same colors as the Admin's alert badges). */
const ALERT_HIGHLIGHT: Partial<Record<NotificationType, { accent: string; iconBg: string; icon: ReactNode }>> = {
  OVERDUE: {
    accent: '#C5221F',
    iconBg: '#FCE8E6',
    icon: <ErrorRoundedIcon sx={{ fontSize: 18, color: '#C5221F' }} />,
  },
  AT_RISK: {
    accent: '#F9AB00',
    iconBg: '#FEF7E0',
    icon: <WarningRoundedIcon sx={{ fontSize: 18, color: '#F9AB00' }} />,
  },
};

interface NotificationsListProps {
  notifications: NotificationResponse[];
  isLoading: boolean;
  markingReadId: number | null;
  onSelect: (notification: NotificationResponse) => void;
  /** Committee Lead only: Overdue alerts by ID, used to show "Add explanation" on Overdue notifications. */
  overdueByAlertId?: Record<number, CommitteeOverdueAlert>;
  onExplain?: (alert: CommitteeOverdueAlert) => void;
}

const NotificationsList = ({
  notifications,
  isLoading,
  markingReadId,
  onSelect,
  overdueByAlertId,
  onExplain,
}: NotificationsListProps) => {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Paper key={index} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Skeleton variant="rounded" height={20} width="50%" />
                  <Skeleton variant="rounded" height={16} width="90%" />
                </Stack>
                <Skeleton variant="rounded" height={24} width={90} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" height={16} width={140} />
                <Skeleton variant="rounded" height={16} width={160} />
              </Stack>
            </Stack>
          </Paper>
        ))}
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
          KPI alerts and updates for your organization will appear here.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.5}>
      {notifications.map((notification) => {
        const unread = isUnreadNotification(notification.status);
        const isMarking = markingReadId === notification.id;
        const overdueAlert =
          notification.notificationType === 'OVERDUE' && notification.alertId != null
            ? overdueByAlertId?.[notification.alertId]
            : undefined;
        const highlight = ALERT_HIGHLIGHT[notification.notificationType];

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
              borderLeft: highlight ? `4px solid ${highlight.accent}` : undefined,
              borderRadius: 2,
              p: 2.5,
              cursor: unread && !isMarking ? 'pointer' : 'default',
              bgcolor: unread ? 'rgba(66, 110, 240, 0.06)' : 'background.paper',
              opacity: isMarking ? 0.7 : 1,
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': unread && !isMarking
                ? {
                    borderColor: 'primary.main',
                    borderLeftColor: highlight?.accent,
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
                    {highlight && (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: highlight.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {highlight.icon}
                      </Box>
                    )}
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
                  color={getNotificationTypeColor(notification.notificationType)}
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

              {/* Committee Lead: explain the Overdue KPI right here (UC-4.4) */}
              {overdueAlert && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
                  {overdueAlert.explanationStatus === 'Explained' ? (
                    <Stack spacing={0.75}>
                      <Chip
                        label="Explained"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                      />
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                        {overdueAlert.explanation}
                      </Typography>
                    </Stack>
                  ) : (
                    <Button
                      onClick={(event) => {
                        event.stopPropagation(); // don't also mark the notification as read
                        onExplain?.(overdueAlert);
                      }}
                      variant="contained"
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none' }}
                    >
                      Add explanation
                    </Button>
                  )}
                </Box>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default NotificationsList;
