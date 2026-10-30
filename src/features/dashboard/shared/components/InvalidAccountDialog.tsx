import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface InvalidAccountDialogProps {
  open: boolean;
  onLogout: () => void;
  title?: string;
  message?: string;
}

const InvalidAccountDialog = ({ open, onLogout, title = 'Account Invalid', message = 'Account is invalid. Please login with a valid account.' }: InvalidAccountDialogProps) => {
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          p: 0,
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1, bgcolor: 'error.light', color: 'error.dark' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Alert icon={<LogoutOutlinedIcon />} severity="error" sx={{ variant: 'filled', p: 0 }}>
            {title}
          </Alert>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 2 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onLogout}
          variant="contained"
          startIcon={<LogoutOutlinedIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          Log Out
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvalidAccountDialog;

