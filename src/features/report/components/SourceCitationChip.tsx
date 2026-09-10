import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import type { ReportCitation } from '../types/report.types';

interface SourceCitationChipProps {
  citation: ReportCitation;
  /** Position in the deduplicated, report-wide source list — shown as a leading number badge. */
  number: number;
  /** Anchor id so a per-section reference badge can scroll this row into view. */
  anchorId: string;
  /** Briefly true right after a per-section badge jumps here, to draw the eye to the right row. */
  highlighted?: boolean;
  /** Opens the full submission detail drawer for this citation. */
  onOpenDetails: () => void;
}

export default function SourceCitationChip({
  citation,
  number,
  anchorId,
  highlighted,
  onOpenDetails,
}: SourceCitationChipProps) {
  return (
    <Box
      id={anchorId}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 0.5,
        borderRadius: 1,
        transition: 'background-color 0.4s ease',
        bgcolor: highlighted ? '#FFF3CD' : 'transparent',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: '#EFF6FF',
          color: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {number}
      </Box>
      <Chip
        size="small"
        clickable
        onClick={onOpenDetails}
        label={`${citation.kpiName}, ${citation.organizationName}, ${citation.submissionReference}`}
        sx={{
          bgcolor: '#EFF6FF',
          color: '#1D4ED8',
          fontWeight: 600,
          borderRadius: 999,
        }}
      />
    </Box>
  );
}
