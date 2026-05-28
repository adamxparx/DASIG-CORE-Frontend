import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { organizationService } from '../api/organizationService';

interface DeactivateOrganizationDialogProps {
  open: boolean;
  organizationId: number | null;
  onClose: () => void;
  onDeactivated: () => void;
}

const DeactivateOrganizationDialog = ({
  open,
  organizationId,
  onClose,
  onDeactivated,
}: DeactivateOrganizationDialogProps) => {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (isDeactivating) {
      return;
    }
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (organizationId === null) {
      return;
    }

    setIsDeactivating(true);
    setErrorMessage(null);

    try {
      await organizationService.deactivate(organizationId);
      onDeactivated();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Unable to deactivate organization. Please try again.',
      );
    } finally {
      setIsDeactivating(false);
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
          Are you sure you want to deactivate this organization?
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
          disabled={isDeactivating}
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
          disabled={isDeactivating}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            bgcolor: 'error.main',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
          }}
        >
          {isDeactivating ? <CircularProgress size={22} color="inherit" /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeactivateOrganizationDialog;
