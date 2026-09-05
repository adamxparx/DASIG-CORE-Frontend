import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import type { SubmissionReviewStatus } from '../../types/kpiSubmission.types';

interface ReviewActionDialogProps {
  open: boolean;
  action: Exclude<SubmissionReviewStatus, 'PENDING'> | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason?: string) => void;
}

const ReviewActionDialog = ({
  open,
  action,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReviewActionDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const isReject = action === 'REJECTED';

  useEffect(() => {
    if (!open) {
      setRejectionReason('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (isReject && !rejectionReason.trim()) {
      return;
    }
    onSubmit(isReject ? rejectionReason.trim() : undefined);
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isReject ? 'Return submission with comment' : 'Approve member submission'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.7 }}>
            {isReject
              ? 'Tell the member what needs to be corrected before they resubmit.'
              : 'Approving this submission will create an official contribution for Admin dashboards and reports.'}
          </Typography>

          {isReject && (
            <TextField
              label="Reason for rejection"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              multiline
              minRows={4}
              required
              fullWidth
              placeholder="Explain what needs to be fixed."
              error={open && isReject && rejectionReason.length > 0 && !rejectionReason.trim()}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={isReject ? 'error' : 'success'}
          onClick={handleSubmit}
          disabled={isSubmitting || (isReject && !rejectionReason.trim())}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {isSubmitting ? 'Saving...' : isReject ? 'Return with Comment' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewActionDialog;
