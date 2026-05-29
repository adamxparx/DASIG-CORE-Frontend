import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserResponse } from '../types/user.types';
import { formatRoleLabel } from '../utils/userDisplay';

interface UserAccountCreatedDialogProps {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
}

const UserAccountCreatedDialog = ({ open, user, onClose }: UserAccountCreatedDialogProps) => {
  if (!user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 0.5 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Account created
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>{user.name}</strong> ({formatRoleLabel(user.role)}) was added successfully.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          A temporary password was emailed to <strong>{user.email}</strong>. Ask them to check
          their inbox and spam folder, then sign in.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.1,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserAccountCreatedDialog;
