import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Outlet } from 'react-router-dom';
import React from 'react';
import type { UserRole } from '../types/dashboard.types';
import DashboardSidebar from './DashboardSidebar';
import DashboardUserHeader from './DashboardUserHeader';
import { DashboardShellContext } from './DashboardShellContext';

export const DASHBOARD_SIDEBAR_WIDTH = 280;
export const DASHBOARD_SIDEBAR_RAIL_WIDTH = 80;

interface DashboardShellLayoutProps {
  role: UserRole;
}

const DashboardShellLayout = ({ role }: DashboardShellLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <DashboardShellContext.Provider value={{ sidebarOpen, toggleSidebar, mobileOpen, setMobileOpen }}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Desktop sidebar */}
        <Box
          component="aside"
          sx={{
            width: { xs: DASHBOARD_SIDEBAR_WIDTH, md: sidebarOpen ? DASHBOARD_SIDEBAR_WIDTH : DASHBOARD_SIDEBAR_RAIL_WIDTH },
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: { xs: 'none', md: 'block' },
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <DashboardSidebar role={role} />
        </Box>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DASHBOARD_SIDEBAR_WIDTH },
          }}
        >
          <DashboardSidebar role={role} />
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            minHeight: '100vh',
            ml: { xs: 0, md: sidebarOpen ? `${DASHBOARD_SIDEBAR_WIDTH}px` : `${DASHBOARD_SIDEBAR_RAIL_WIDTH}px` },
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <DashboardUserHeader />
          <Outlet />
        </Box>
      </Box>
    </DashboardShellContext.Provider>
  );
};

export default DashboardShellLayout;
