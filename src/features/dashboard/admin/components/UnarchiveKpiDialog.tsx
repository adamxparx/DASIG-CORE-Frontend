import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
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

interface UnarchiveKpiDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  kpiId: number | null;
  kpiName: string;
}

const UnarchiveKpiDialog = ({ open, onClose, onSubmitSuccess, kpiId, kpiName }: UnarchiveKpiDialogProps) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRestore = async () => {
    if (kpiId === null) {
      return;
    }

    setIsRestoring(true);
    setErrorMessage(null);

    try {
      await kpiService.unarchiveKpiDefinition(kpiId);
      window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while restoring the KPI.';
      setErrorMessage(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isRestoring ? undefined : onClose}
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
            border: '1px solid rgba(16, 185, 129, 0.15)',
            boxShadow: '0 24px 48px -12px rgba(16, 185, 129, 0.14), 0 12px 24px -8px rgba(0, 0, 0, 0.08)',
            p: 0,
          },
        },
      }}
    >
      {/* Top Header Banner with Soft Emerald Tint */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%)',
          pt: 3,
          px: 3,
          pb: 1.5,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={isRestoring}
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
          {/* Glowing Emerald Icon Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.25)',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            <UnarchiveOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem', lineHeight: 1.25 }}>
              Restore KPI Definition
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.875rem' }}>
              Reactivate this KPI for tracking, monitoring, and member submissions.
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
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
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
                  bgcolor: '#E2E8F0',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 22,
                }}
              />
            )}
            <Chip
              label="Restore to Active"
              size="small"
              sx={{
                bgcolor: '#DCFCE7',
                color: '#166534',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 22,
              }}
            />
          </Stack>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.975rem', lineHeight: 1.35 }}>
            {kpiName || 'Selected KPI'}
          </Typography>
        </Box>

        {/* Reactivation Details */}
        <Box
          sx={{
            bgcolor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '14px',
            p: 2,
            mb: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.25 }}>
            What happens on restore
          </Typography>

          <Stack spacing={1.25}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#16A34A', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Returns to Active KPIs
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Immediately listed on active management hubs and reflected in consortium summaries.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <PlayCircleOutlinedIcon sx={{ fontSize: 18, color: '#059669', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Submissions re-enabled
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Committee members and leads can submit period progress reports again.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 18, color: '#D97706', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Deadline tracking resumes
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Automated deadline reminders and warning notifications will be re-evaluated.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isRestoring}
          variant="outlined"
          sx={{
            borderColor: '#E2E8F0',
            color: '#475569',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.925rem',
            borderRadius: '12px',
            px: 2.5,
            py: 0.9,
            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRestore}
          variant="contained"
          disabled={isRestoring}
          sx={{
            bgcolor: '#16A34A',
            color: '#FFFFFF',
            fontWeight: 600,
            px: 3,
            py: 0.9,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.925rem',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#15803D',
              boxShadow: '0 6px 18px rgba(22, 163, 74, 0.45)',
            },
          }}
        >
          {isRestoring ? <CircularProgress size={20} color="inherit" /> : 'Restore KPI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnarchiveKpiDialog;
