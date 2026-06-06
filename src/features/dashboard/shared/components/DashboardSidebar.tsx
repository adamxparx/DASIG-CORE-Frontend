import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../../../../routes';
import logo from '../../../../assets/logo.png';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
import { useUnreadNotificationCount } from '../../../notification/hooks/useUnreadNotificationCount';
import type { UserRole } from '../types/dashboard.types';

interface DashboardSidebarProps {
  role: UserRole;
}

interface SidebarItem {
  key: string;
  label: string;
  icon: ReactElement;
  path?: string;
}

const adminPaths: Record<string, string> = {
  dashboard: routes.adminDashboard,
  users: routes.adminUsers,
  organizations: routes.adminOrganizations,
  alerts: routes.adminAlerts,
  reports: routes.adminReports,
};

const roleMenus: Record<UserRole, SidebarItem[]> = {
  DASIG_ADMIN: [
    { key: 'dashboard', label: 'Admin Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: adminPaths.dashboard },
    { key: 'users', label: 'User Management', icon: <ManageAccountsOutlinedIcon />, path: adminPaths.users },
    { key: 'organizations', label: 'Organization Management', icon: <CorporateFareOutlinedIcon />, path: adminPaths.organizations },
    { key: 'alerts', label: 'Alerts', icon: <CampaignOutlinedIcon /> },
    { key: 'reports', label: 'Report Generation', icon: <SummarizeOutlinedIcon /> },
  ],
  TBI_MANAGER: [
    { key: 'dashboard', label: 'TBI Dashboard', icon: <SpaceDashboardOutlinedIcon /> },
    { key: 'notifications', label: 'Notifications', icon: <NotificationsOutlinedIcon /> },
    { key: 'history', label: 'Submission History', icon: <AssignmentTurnedInOutlinedIcon /> },
    { key: 'submit', label: 'Submit KPI', icon: <PostAddOutlinedIcon /> },
  ],
  STAFF: [
    { key: 'dashboard', label: 'Staff Dashboard', icon: <SpaceDashboardOutlinedIcon /> },
    { key: 'notifications', label: 'Notifications', icon: <NotificationsOutlinedIcon /> },
    { key: 'submit', label: 'Submit KPI', icon: <PostAddOutlinedIcon /> },
    { key: 'history', label: 'Submission History', icon: <AssignmentTurnedInOutlinedIcon /> },
  ],
};

const staffPaths: Record<string, string> = {
  dashboard: routes.staffDashboard,
  notifications: routes.staffNotifications,
  submit: routes.staffSubmitKpi,
  history: routes.staffSubmissionHistory,
};

const tbiPaths: Record<string, string> = {
  dashboard: routes.tbiManagerDashboard,
  notifications: routes.tbiManagerNotifications,
  submit: routes.tbiManagerSubmitKpi,
  history: routes.tbiManagerSubmissionHistory,
};

function isItemSelected(pathname: string, item: SidebarItem): boolean {
  if (!item.path) {
    return false;
  }

  if (item.path === routes.adminDashboard || item.path === routes.staffDashboard || item.path === routes.tbiManagerDashboard) {
    return pathname === item.path;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

// Role-specific sidebar background colours (using existing theme colours)
const roleAccent: Record<UserRole, { main: string; dark: string; label: string }> = {
  DASIG_ADMIN: { main: '#426ef0', dark: '#2f55c7', label: 'Admin' },
  TBI_MANAGER: { main: '#7C3AED', dark: '#5b28b0', label: 'TBI Manager' },
  STAFF: { main: '#059669', dark: '#047350', label: 'Staff' },
};

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const showNotificationBadge = role === 'STAFF' || role === 'TBI_MANAGER';
  const { unreadCount } = useUnreadNotificationCount(showNotificationBadge);

  const accent = roleAccent[role];

  const pathByKey =
    role === 'DASIG_ADMIN' ? adminPaths : role === 'STAFF' ? staffPaths : tbiPaths;

  const menuItems = roleMenus[role].map((item) => ({
    ...item,
    path: item.path ?? pathByKey[item.key],
  }));

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    tokenStorage.clear();
    navigate(routes.auth, { replace: true });
  };

  const handleNavClick = (item: SidebarItem) => {
    const target = item.path ?? pathByKey[item.key];
    if (target) {
      navigate(target);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: accent.main,
        border: 'none',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Logo + title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: '#ffffff',
              border: '2.5px solid rgba(255,255,255,0.95)',
              boxShadow: '0 0 0 4px rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="DASIG Logo"
              sx={{
                width: 34,
                height: 34,
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: '0.25px', color: '#fff' }}
          >
            DASIG-CORE
          </Typography>
        </Box>

        {/* Subtitle + role label */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 0.25 }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
            Consortium KPI Platform
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              px: 0.9,
              py: 0.15,
              borderRadius: 0.75,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              lineHeight: 1.7,
            }}
          >
            {accent.label}
          </Box>
        </Box>
      </Box>

      {/* ── Nav items ── */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={isItemSelected(pathname, item)}
            onClick={() => handleNavClick(item)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255,255,255,0.85)',
              '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.75)' },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.22)',
                color: '#fff',
                fontWeight: 700,
                '& .MuiListItemIcon-root': { color: '#fff' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.28)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
              {item.key === 'notifications' && showNotificationBadge ? (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  invisible={unreadCount === 0}
                  max={99}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* ── Logout ── */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ p: 1.5 }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
            color: 'rgba(255,255,255,0.8)',
            '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.7)' },
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              '& .MuiListItemIcon-root': { color: '#fff' },
            },
          }}
          onClick={() => setLogoutDialogOpen(true)}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      {/* ── Logout dialog ── */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1.5,
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
              maxWidth: 400,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1, color: '#1A1C1E' }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
            Are you sure you want to log out? You will need to sign back in to access your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1.5 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{
              color: '#5F6368',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'transparent', color: '#1A1C1E' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              bgcolor: '#D93025',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              py: 0.75,
              borderRadius: '24px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B8251B', boxShadow: 'none' },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DashboardSidebar;

