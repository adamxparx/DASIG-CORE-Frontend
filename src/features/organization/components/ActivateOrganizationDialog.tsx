import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { organizationService } from '../api/organizationService';

interface ActivateOrganizationDialogProps {
  open: boolean;
  organizationId: number | null;
  onClose: () => void;
  onActivated: () => void;
}

const ActivateOrganizationDialog = ({
  open,
  organizationId,
  onClose,
  onActivated,
}: ActivateOrganizationDialogProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (isActivating) {
      return;
    }
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (organizationId === null) {
      return;
    }

    setIsActivating(true);
    setErrorMessage(null);

    try {
      await organizationService.activate(organizationId);
      onActivated();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Unable to activate organization. Please try again.',
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
          Are you sure you want to activate this organization?
        </Typography>
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isActivating}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          disabled={isActivating}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            bgcolor: 'success.main',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'success.dark', boxShadow: 'none' },
          }}
        >
          {isActivating ? <CircularProgress size={22} color="inherit" /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivateOrganizationDialog;
