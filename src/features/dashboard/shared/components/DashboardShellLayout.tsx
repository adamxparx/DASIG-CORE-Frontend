import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import type { UserRole } from '../types/dashboard.types';
import DashboardSidebar from './DashboardSidebar';

export const DASHBOARD_SIDEBAR_WIDTH = 280;

interface DashboardShellLayoutProps {
  role: UserRole;
}

const DashboardShellLayout = ({ role }: DashboardShellLayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="aside"
        sx={{
          width: DASHBOARD_SIDEBAR_WIDTH,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <DashboardSidebar role={role} />
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          ml: { xs: 0, md: `${DASHBOARD_SIDEBAR_WIDTH}px` },
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardShellLayout;
