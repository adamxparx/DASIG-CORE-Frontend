import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/dashboard.types';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  role: UserRole;
  header: ReactNode;
  welcomeBanner?: ReactNode;
  topActions?: ReactNode;
  filterBar: ReactNode;
  content: ReactNode;
}

const DashboardLayout = ({ role, header, welcomeBanner, topActions, filterBar, content }: DashboardLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar role={role} />

      <Box sx={{ flex: 1 }}>
        <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
          {header}
          {welcomeBanner}
          {topActions}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
            {filterBar}
          </Paper>
          <Box>{content}</Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
