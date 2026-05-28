import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface WelcomeBannerProps {
  message: string;
}

const WelcomeBanner = ({ message }: WelcomeBannerProps) => {
  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );
};

export default WelcomeBanner;
