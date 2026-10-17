import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ApiError } from '../../../lib/api/client';
import { committeeAlertsService } from '../api/committeeAlertsService';
import type { CommitteeOverdueAlert } from '../types/alerts.types';

const EXPLANATION_MAX_LENGTH = 2000;

interface ExplainOverdueDialogProps {
  alert: CommitteeOverdueAlert | null;
  onClose: () => void;
  onSubmitted: (updated: CommitteeOverdueAlert) => void;
}

/** The Committee Lead explains why an overdue KPI was not accomplished (one per alert). */
const ExplainOverdueDialog = ({ alert, onClose, onSubmitted }: ExplainOverdueDialogProps) => {
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!alert || explanation.trim() === '') {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updated = await committeeAlertsService.submitExplanation(alert.alertId, explanation.trim());
      onSubmitted(updated);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to submit the explanation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={alert !== null}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Explain overdue KPI</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {alert?.kpiName}: tell the Admin why the target was not met by the deadline. You can submit only one
          explanation for this alert.
        </Typography>
        <TextField
          label="Explanation"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          required
          multiline
          minRows={5}
          fullWidth
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: EXPLANATION_MAX_LENGTH } }}
          helperText={`${explanation.length}/${EXPLANATION_MAX_LENGTH}`}
        />
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, borderColor: 'divider', color: 'text.primary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || explanation.trim() === ''}
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, boxShadow: 'none' }}
        >
          {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Submit explanation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExplainOverdueDialog;
