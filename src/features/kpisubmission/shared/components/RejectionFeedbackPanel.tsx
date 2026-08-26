import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface RejectionFeedbackPanelProps {
  rejectionReason?: string;
  reviewedByName?: string;
  reviewedAt?: string;
}

const formatReviewedAt = (reviewedAt?: string) => {
  if (!reviewedAt) {
    return null;
  }
  return new Date(reviewedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const RejectionFeedbackPanel = ({
  rejectionReason,
  reviewedByName,
  reviewedAt,
}: RejectionFeedbackPanelProps) => {
  const reviewedAtLabel = formatReviewedAt(reviewedAt);

  return (
    <Alert
      severity="error"
      icon={<ChatBubbleOutlineOutlinedIcon fontSize="small" />}
      sx={{
        borderRadius: 3,
        alignItems: 'flex-start',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Stack spacing={0.75}>
        <Typography sx={{ fontWeight: 800 }}>Returned with comment</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          {rejectionReason || 'No rejection reason was provided.'}
        </Typography>
        {(reviewedByName || reviewedAtLabel) && (
          <Typography variant="caption" sx={{ color: '#7F1D1D' }}>
            {reviewedByName ? `Reviewed by ${reviewedByName}` : 'Reviewed'}
            {reviewedAtLabel ? ` on ${reviewedAtLabel}` : ''}
          </Typography>
        )}
      </Stack>
    </Alert>
  );
};

export default RejectionFeedbackPanel;
