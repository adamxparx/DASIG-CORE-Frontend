import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../../../../routes';
import { tokenStorage } from '../../../auth/utils/tokenStorage';
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
    { key: 'assigned', label: 'Assigned KPIs', icon: <AssessmentOutlinedIcon /> },
    { key: 'history', label: 'Submission History', icon: <AssignmentTurnedInOutlinedIcon /> },
    { key: 'submit', label: 'Submit KPI', icon: <PostAddOutlinedIcon /> },
  ],
  STAFF: [
    { key: 'dashboard', label: 'Staff Dashboard', icon: <SpaceDashboardOutlinedIcon /> },
    { key: 'assigned', label: 'Assigned KPIs', icon: <AssessmentOutlinedIcon /> },
    { key: 'submit', label: 'Submit KPI', icon: <PostAddOutlinedIcon /> },
    { key: 'history', label: 'Submission History', icon: <AssignmentTurnedInOutlinedIcon /> },
  ],
};

const staffPaths: Record<string, string> = {
  dashboard: routes.staffDashboard,
  submit: routes.staffSubmitKpi,
  history: routes.staffSubmissionHistory,
};

const tbiPaths: Record<string, string> = {
  dashboard: routes.tbiManagerDashboard,
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

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pathByKey =
    role === 'DASIG_ADMIN' ? adminPaths : role === 'STAFF' ? staffPaths : tbiPaths;

  const menuItems = roleMenus[role].map((item) => ({
    ...item,
    path: item.path ?? pathByKey[item.key],
  }));

  const handleLogout = () => {
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
        borderRight: 1,
        borderColor: 'divider',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          DASIG-CORE
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consortium KPI Platform
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={isItemSelected(pathname, item)}
            onClick={() => handleNavClick(item)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ p: 1.5 }}>
        <ListItemButton sx={{ borderRadius: 2 }} onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Paper>
  );
};

export default DashboardSidebar;
