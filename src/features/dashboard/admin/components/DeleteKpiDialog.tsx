import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ALERTS_CHANGED_EVENT } from '../../../alerts/api/alertsService';
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
      window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
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
      onClose={isDeleting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          },
        },
        paper: {
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            boxShadow: '0 24px 48px -12px rgba(220, 38, 38, 0.14), 0 12px 24px -8px rgba(0, 0, 0, 0.08)',
            p: 0,
          },
        },
      }}
    >
      {/* Top Header Banner with Soft Danger Tint */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)',
          pt: 3,
          px: 3,
          pb: 1.5,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={isDeleting}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: '#9CA3AF',
            '&:hover': { color: '#4B5563', bgcolor: 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          {/* Glowing Red Icon Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.25)',
              color: '#DC2626',
              flexShrink: 0,
            }}
          >
            <DeleteForeverOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem', lineHeight: 1.25 }}>
              Delete KPI Definition
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.875rem' }}>
              This action permanently destroys this KPI and all associated data.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.875rem' }}>
            {errorMessage}
          </Alert>
        )}

        {/* Selected KPI Item Preview Box */}
        <Box
          sx={{
            bgcolor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            p: 2,
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            {kpiId !== null && (
              <Chip
                label={`KPI #${kpiId}`}
                size="small"
                sx={{
                  bgcolor: '#E5E7EB',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 22,
                }}
              />
            )}
            <Chip
              label="Permanent Deletion"
              size="small"
              sx={{
                bgcolor: '#FEE2E2',
                color: '#991B1B',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 22,
              }}
            />
          </Stack>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.975rem', lineHeight: 1.35 }}>
            {kpiName || 'Selected KPI'}
          </Typography>
        </Box>

        {/* Consequences Breakdown Callout */}
        <Box
          sx={{
            bgcolor: '#FFF1F2',
            border: '1px solid #FFE4E6',
            borderRadius: '14px',
            p: 2,
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#DC2626' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#991B1B', fontSize: '0.85rem' }}>
              What will be deleted:
            </Typography>
          </Stack>

          <Stack spacing={0.75} sx={{ pl: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#DC2626', mt: 0.85, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#7F1D1D', fontSize: '0.825rem', lineHeight: 1.4 }}>
                All member and committee submissions and progress values
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#DC2626', mt: 0.85, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#7F1D1D', fontSize: '0.825rem', lineHeight: 1.4 }}>
                All uploaded verification evidence and attached files
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#DC2626', mt: 0.85, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#7F1D1D', fontSize: '0.825rem', lineHeight: 1.4 }}>
                Active KPI alerts and notifications
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Audit / Archiving Alternative Note */}
        <Box
          sx={{
            bgcolor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: '12px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#16A34A', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#166534', fontWeight: 500, lineHeight: 1.4 }}>
            <strong>Recommendation:</strong> Use <strong>Archive</strong> instead if you want to pause submissions while keeping historical reports.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          variant="outlined"
          sx={{
            borderColor: '#E5E7EB',
            color: '#4B5563',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.925rem',
            borderRadius: '12px',
            px: 2.5,
            py: 0.9,
            '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={isDeleting}
          sx={{
            bgcolor: '#DC2626',
            color: '#FFFFFF',
            fontWeight: 600,
            px: 3,
            py: 0.9,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.925rem',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#B91C1C',
              boxShadow: '0 6px 18px rgba(220, 38, 38, 0.45)',
            },
          }}
        >
          {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteKpiDialog;
