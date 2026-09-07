import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NarrativeReportParser from './NarrativeReportParser';
import SectionSourceRefs from './SectionSourceRefs';
import SourceCitationChip from './SourceCitationChip';
import type { ReportCitation, ReportSection } from '../types/report.types';

interface StructuredReportViewProps {
  sections: ReportSection[];
}

const sectionHeadingSx = {
  fontWeight: 800,
  color: 'primary.main',
  fontSize: '1.3rem',
  letterSpacing: '-0.3px',
} as const;

/**
 * Renders a structured (citation-aware) report: each section's heading + narrative body in
 * order, with a small row of numbered reference badges underneath — not full citation chips,
 * since the same KPI submission often backs several sections and repeating its full detail
 * every time would just be noise. The numbers point into one deduplicated "Sources" list at
 * the end of the report, where each unique submission is described exactly once.
 */
export default function StructuredReportView({ sections }: StructuredReportViewProps) {
  const { uniqueSources, numbersBySection } = useMemo(() => {
    const numberBySubmissionId = new Map<number, number>();
    const sources: ReportCitation[] = [];

    for (const section of sections) {
      for (const citation of section.sources) {
        if (!numberBySubmissionId.has(citation.submissionId)) {
          numberBySubmissionId.set(citation.submissionId, sources.length + 1);
          sources.push(citation);
        }
      }
    }

    const perSectionNumbers = sections.map((section) => {
      const numbers = section.sources.map((citation) => numberBySubmissionId.get(citation.submissionId)!);
      // De-duplicate within a section too, in case the same submission is cited twice by one section.
      return Array.from(new Set(numbers)).sort((a, b) => a - b);
    });

    return { uniqueSources: sources, numbersBySection: perSectionNumbers };
  }, [sections]);

  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);

  const handleSelectSource = (num: number) => {
    setHighlightedNumber(num);
    window.setTimeout(() => setHighlightedNumber((current) => (current === num ? null : current)), 1500);
  };

  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      {sections.map((section, idx) => (
        <Box key={section.heading}>
          <Box
            sx={{
              pt: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              mt: idx === 0 ? 0 : 4,
            }}
          >
            <Typography variant="h5" sx={sectionHeadingSx}>
              {section.heading}
            </Typography>
          </Box>
          <NarrativeReportParser
            text={section.text}
            trailingInline={<SectionSourceRefs numbers={numbersBySection[idx]} onSelect={handleSelectSource} />}
          />
        </Box>
      ))}

      {uniqueSources.length > 0 && (
        <Box>
          <Box
            sx={{
              pt: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              mt: 4,
            }}
          >
            <Typography variant="h5" sx={sectionHeadingSx}>
              Sources
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            {uniqueSources.map((citation, idx) => (
              <SourceCitationChip
                key={citation.submissionId}
                citation={citation}
                number={idx + 1}
                anchorId={`source-${idx + 1}`}
                highlighted={highlightedNumber === idx + 1}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
