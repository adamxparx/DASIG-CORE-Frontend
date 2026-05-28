import { Box, Typography } from '@mui/material';

const TbiManagerDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, TBI Manager!
      </Typography>
      <Typography variant="body1">This is your main dashboard view.</Typography>
    </Box>
  );
};

export default TbiManagerDashboard;