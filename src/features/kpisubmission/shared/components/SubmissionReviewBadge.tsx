import Chip from '@mui/material/Chip';
import type { SubmissionReviewStatus } from '../../types/kpiSubmission.types';

const reviewStatusMap: Record<SubmissionReviewStatus, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Pending', bg: '#FEF3C7', color: '#B45309' },
  APPROVED: { label: 'Approved', bg: '#DDF4E8', color: '#14945F' },
  REJECTED: { label: 'Rejected', bg: '#FFE2E2', color: '#C62828' },
};

interface SubmissionReviewBadgeProps {
  status?: SubmissionReviewStatus;
}

const SubmissionReviewBadge = ({ status }: SubmissionReviewBadgeProps) => {
  const resolvedStatus = status ?? 'PENDING';
  const reviewStatus = reviewStatusMap[resolvedStatus];

  return (
    <Chip
      size="small"
      label={reviewStatus.label}
      sx={{
        bgcolor: reviewStatus.bg,
        color: reviewStatus.color,
        fontWeight: 700,
        borderRadius: 999,
      }}
    />
  );
};

export default SubmissionReviewBadge;
