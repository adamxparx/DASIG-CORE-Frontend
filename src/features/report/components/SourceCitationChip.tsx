import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import type { ReportCitation } from '../types/report.types';

interface SourceCitationChipProps {
  citation: ReportCitation;
  /** Position in the deduplicated, report-wide source list — shown as a leading number badge. */
  number: number;
  /** Anchor id so a per-section reference badge can scroll this row into view. */
  anchorId: string;
  /** Briefly true right after a per-section badge jumps here, to draw the eye to the right row. */
  highlighted?: boolean;
}

// Matches the "Month dd, yyyy" convention used for dates elsewhere in the app
// (e.g. AlertDetailModal, SubmitKpiEntryPage) rather than the raw ISO string from the API.
const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

export default function SourceCitationChip({ citation, number, anchorId, highlighted }: SourceCitationChipProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      id={anchorId}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
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
          mt: '2px',
        }}
      >
        {number}
      </Box>
      <Box>
        <Chip
          size="small"
          clickable
          onClick={() => setExpanded((prev) => !prev)}
          label={`${citation.kpiName} · ${citation.organizationName}`}
          sx={{
            bgcolor: '#EFF6FF',
            color: '#1D4ED8',
            fontWeight: 600,
            borderRadius: 999,
          }}
        />
        <Collapse in={expanded}>
          <Box sx={{ mt: 0.5, pl: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Submission #{citation.submissionId} · submitted {citation.submittedValue} vs target{' '}
              {citation.targetValue} · {formatDate(citation.submissionDate)}
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
