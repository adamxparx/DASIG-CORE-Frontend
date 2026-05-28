import { Box, Typography } from '@mui/material';

const StaffDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, Staff!
      </Typography>
      <Typography variant="body1">This is your main dashboard view.</Typography>
    </Box>
  );
};

export default StaffDashboard;