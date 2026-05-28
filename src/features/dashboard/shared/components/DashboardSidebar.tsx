import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
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
import { useNavigate } from 'react-router-dom';
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
}

const roleMenus: Record<UserRole, SidebarItem[]> = {
  DASIG_ADMIN: [
    { key: 'dashboard', label: 'Admin Dashboard', icon: <SpaceDashboardOutlinedIcon /> },
    { key: 'users', label: 'User Management', icon: <ManageAccountsOutlinedIcon /> },
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

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenStorage.clear();
    navigate(routes.auth, { replace: true });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        borderRight: 1,
        borderColor: 'divider',
        minHeight: '100vh',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
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
      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {roleMenus[role].map((item, index) => (
          <ListItemButton key={item.key} selected={index === 0} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
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
