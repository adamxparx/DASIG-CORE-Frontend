import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

interface SectionSourceRefsProps {
  /** Numbers (from the deduplicated, report-wide source list) that back this section. */
  numbers: number[];
  onSelect: (num: number) => void;
}

/**
 * Small numbered badges rendered inline at the end of a section's text, e.g. "...fell short
 * of target ①③." — deliberately just numbers, not full KPI/org chips, since the same
 * submission often backs several sections and repeating its full detail every time it's cited
 * would be redundant. Clicking a number jumps to (and briefly highlights) that entry in the
 * single consolidated source list at the end of the report.
 */
export default function SectionSourceRefs({ numbers, onSelect }: SectionSourceRefsProps) {
  if (numbers.length === 0) {
    return null;
  }

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 0.75 }}>
      {numbers.map((num) => (
        <Chip
          key={num}
          size="small"
          clickable
          onClick={() => {
            onSelect(num);
            document.getElementById(`source-${num}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }}
          label={num}
          sx={{
            minWidth: 20,
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: '#EFF6FF',
            color: '#1D4ED8',
            borderRadius: 999,
            verticalAlign: 'middle',
            '& .MuiChip-label': { px: 0.6 },
          }}
        />
      ))}
    </Box>
  );
}
