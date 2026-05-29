import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { getDeadlineAlertTestDates } from '../utils/notificationDisplay';

type NotificationTroubleshootingProps = {
  signedInEmail?: string;
};

const NotificationTroubleshooting = ({ signedInEmail }: NotificationTroubleshootingProps) => {
  const { sevenDayDeadline, twoDayDeadline } = getDeadlineAlertTestDates();

  return (
    <Alert severity="warning" sx={{ borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        No notifications loaded
      </Typography>
      {signedInEmail && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Signed in as <strong>{signedInEmail}</strong>. Alerts only appear for KPIs assigned to
          your organization in User Management.
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1 }}>
        Alerts are created when a KPI deadline is exactly 7 or 2 calendar days away (backend uses{' '}
        <strong>Asia/Manila</strong>). Matching deadlines today:{' '}
        <strong>{sevenDayDeadline}</strong> (7-day) or <strong>{twoDayDeadline}</strong> (2-day).
      </Typography>
      <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2.5 }}>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          <ListItemText
            primary={
              <Typography variant="body2">
                Confirm Staff/TBI “Assigned Organization” matches the KPI’s assigned organization.
              </Typography>
            }
          />
        </ListItem>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          <ListItemText
            primary={
              <Typography variant="body2">
                Ask an admin to create or update a KPI with one of the matching deadlines above,
                then click Refresh.
              </Typography>
            }
          />
        </ListItem>
      </List>
    </Alert>
  );
};

export default NotificationTroubleshooting;
