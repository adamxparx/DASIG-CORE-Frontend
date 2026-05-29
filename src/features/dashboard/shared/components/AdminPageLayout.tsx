import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface AdminPageLayoutProps {
  children: ReactNode;
}

const AdminPageLayout = ({ children }: AdminPageLayoutProps) => {
  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      {children}
    </Box>
  );
};

export default AdminPageLayout;
