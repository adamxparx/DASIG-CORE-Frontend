import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';

interface AdminPageLayoutProps {
  children: ReactNode;
}

const AdminPageLayout = ({ children }: AdminPageLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar role="DASIG_ADMIN" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
    </Box>
  );
};

export default AdminPageLayout;
