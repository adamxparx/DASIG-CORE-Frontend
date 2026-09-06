import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
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

interface ArchiveKpiDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  kpiId: number | null;
  kpiName: string;
}

const ArchiveKpiDialog = ({ open, onClose, onSubmitSuccess, kpiId, kpiName }: ArchiveKpiDialogProps) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleArchive = async () => {
    if (kpiId === null) {
      return;
    }

    setIsArchiving(true);
    setErrorMessage(null);

    try {
      await kpiService.archiveKpiDefinition(kpiId);
      window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while archiving the KPI.';
      setErrorMessage(msg);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isArchiving ? undefined : onClose}
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
            border: '1px solid rgba(26, 115, 232, 0.15)',
            boxShadow: '0 24px 48px -12px rgba(26, 115, 232, 0.14), 0 12px 24px -8px rgba(0, 0, 0, 0.08)',
            p: 0,
          },
        },
      }}
    >
      {/* Top Header Banner with Soft Blue Tint */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)',
          pt: 3,
          px: 3,
          pb: 1.5,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={isArchiving}
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
          {/* Glowing Blue Icon Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 8px 16px -4px rgba(26, 115, 232, 0.25)',
              color: '#1A73E8',
              flexShrink: 0,
            }}
          >
            <ArchiveOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem', lineHeight: 1.25 }}>
              Archive KPI Definition
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.875rem' }}>
              Safely pause this KPI while preserving all historical data and reports.
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
              label="Move to Archived"
              size="small"
              sx={{
                bgcolor: '#E0E7FF',
                color: '#3730A3',
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

        {/* Impact Highlights */}
        <Box
          sx={{
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.25 }}>
            Impact & Benefits
          </Typography>

          <Stack spacing={1.25}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#16A34A', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Historical submissions preserved
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Past progress, approvals, and uploaded files remain intact for auditing.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <PauseCircleOutlinedIcon sx={{ fontSize: 18, color: '#1A73E8', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Active submissions paused
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Hidden from committee active queues so no new entries are filed.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <NotificationsOffOutlinedIcon sx={{ fontSize: 18, color: '#6366F1', mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', lineHeight: 1.3 }}>
                  Alerts & notifications silenced
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, lineHeight: 1.35 }}>
                  Clears active deadline warnings from the admin and lead dashboards.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Reversibility Highlight */}
        <Box
          sx={{
            bgcolor: '#ECFDF5',
            border: '1px solid #D1FAE5',
            borderRadius: '12px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#059669', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 500, lineHeight: 1.4 }}>
            You can restore this KPI to Active at any time from the <strong>Archived KPIs</strong> tab.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isArchiving}
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
          onClick={handleArchive}
          variant="contained"
          disabled={isArchiving}
          sx={{
            bgcolor: '#1A73E8',
            color: '#FFFFFF',
            fontWeight: 600,
            px: 3,
            py: 0.9,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.925rem',
            boxShadow: '0 4px 14px rgba(26, 115, 232, 0.35)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#1557B0',
              boxShadow: '0 6px 18px rgba(26, 115, 232, 0.45)',
            },
          }}
        >
          {isArchiving ? <CircularProgress size={20} color="inherit" /> : 'Archive KPI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveKpiDialog;
