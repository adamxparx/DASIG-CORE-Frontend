import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface OrganizationAssignmentDialogProps {
  open: boolean;
  onLogout: () => void;
}

const OrganizationAssignmentDialog = ({ open, onLogout }: OrganizationAssignmentDialogProps) => {
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
      <DialogTitle sx={{ p: 3, pb: 1, bgcolor: 'warning.light', color: 'warning.dark' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Alert icon={<LogoutOutlinedIcon />} severity="warning" sx={{ variant: 'filled', p: 0 }}>
            Organization Not Assigned
          </Alert>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 2 }}>
          Your account has not been assigned an organization yet. Please contact your administrator.
        </Typography>
        
        <Alert severity="info" sx={{ variant: 'outlined', mb: 3 }}>
          You cannot access the dashboard until an administrator assigns you to an organization.
        </Alert>
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

export default OrganizationAssignmentDialog;