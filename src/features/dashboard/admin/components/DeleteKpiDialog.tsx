import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { kpiService } from '../../shared/api/kpiService';

interface DeleteKpiDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  kpiId: number | null;
  kpiName: string;
}

const DeleteKpiDialog = ({ open, onClose, onSubmitSuccess, kpiId, kpiName }: DeleteKpiDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (kpiId === null) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await kpiService.deleteKpiDefinition(kpiId);
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while deleting the KPI.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 2.5,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
            {errorMessage}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
          {/* Circular red warning icon badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: '#FCE8E6',
              color: '#D93025',
              flexShrink: 0,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            {/* Header Title */}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1C1E', mb: 1, fontSize: '1.25rem' }}>
              Delete KPI
            </Typography>

            {/* Subtext description */}
            <Typography variant="body1" sx={{ color: '#5F6368', mb: 1.75, lineHeight: 1.45, fontSize: '0.975rem' }}>
              Are you sure you want to delete "{kpiName}"?
            </Typography>

            {/* Red alert text */}
            <Typography variant="body1" sx={{ color: '#D93025', fontWeight: 600, lineHeight: 1.45, fontSize: '0.975rem' }}>
              This KPI has existing submissions. Deleting it will remove all associated data.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          sx={{
            color: '#5F6368',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: 'transparent', color: '#1A1C1E' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={isDeleting}
          sx={{
            bgcolor: '#D93025',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: '24px',
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#B82015',
              boxShadow: 'none',
            },
          }}
        >
          {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteKpiDialog;
