import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface NarrativeReportParserProps {
  text: string;
}

/**
 * Robust inline formatter for bold text (**text**) and clean spacing.
 * Dynamically splits strings to render bold segments safely inside standard tags.
 */
function formatInlineBold(text: string): ReactNode[] | string {
  if (!text.includes('**')) {
    return text;
  }

  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <Box component="span" key={index} sx={{ fontWeight: 700, color: 'text.primary' }}>
          {part}
        </Box>
      );
    }
    return part;
  });
}

export default function NarrativeReportParser({ text }: NarrativeReportParserProps) {
  if (!text) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No report content available.
      </Typography>
    );
  }

  // Split narrative by double-newlines to process paragraph blocks
  const blocks = text.split(/\n\s*\n/);

  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. HEADINGS (e.g. ### 1. Overall Performance Summary)
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s*(.*)$/);
          if (match) {
            const level = match[1].length;
            const headingText = match[2].trim();
            
            // Map heading levels to stylish theme sizes
            const variant = level === 1 ? 'h4' : level === 2 ? 'h5' : 'h6';
            const isMainSection = level <= 3;
            
            return (
              <Box
                key={blockIdx}
                sx={{
                  pt: isMainSection ? 2 : 1,
                  pb: 0.5,
                  borderBottom: isMainSection ? '1px solid' : 'none',
                  borderColor: 'divider',
                  mt: isMainSection ? 4 : 2,
                  '&:first-of-type': { mt: 0, pt: 0 },
                }}
              >
                <Typography
                  variant={variant}
                  sx={{
                    fontWeight: 800,
                    color: isMainSection ? 'primary.main' : 'text.primary',
                    fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.3rem' : '1.1rem',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {headingText}
                </Typography>
              </Box>
            );
          }
        }

        // 2. BULLET LIST ITEMS (e.g. - Server Response Time: Target...)
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const lines = trimmed.split('\n');
          return (
            <Stack key={blockIdx} spacing={1} sx={{ pl: 2, my: 1 }}>
              {lines.map((line, lineIdx) => {
                const lineContent = line.replace(/^[-*]\s*/, '').trim();
                return (
                  <Box
                    key={lineIdx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    {/* Beautiful colored bullet indicator */}
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: 1.25,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                      {formatInlineBold(lineContent)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          );
        }

        // 3. NUMBERED LIST ITEMS (e.g. 1. Overall Performance...)
        if (/^\d+\.\s+/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <Stack key={blockIdx} spacing={1} sx={{ pl: 2, my: 1 }}>
              {lines.map((line, lineIdx) => {
                const match = line.match(/^(\d+)\.\s*(.*)$/);
                if (match) {
                  const num = match[1];
                  const lineContent = match[2].trim();
                  return (
                    <Box
                      key={lineIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          minWidth: 16,
                          flexShrink: 0,
                          textAlign: 'right',
                        }}
                      >
                        {num}.
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                        {formatInlineBold(lineContent)}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })}
            </Stack>
          );
        }

        // 4. PARAGRAPH BLOCKS
        return (
          <Typography
            key={blockIdx}
            variant="body1"
            sx={{
              lineHeight: 1.7,
              color: 'text.secondary',
              mb: 1.5,
            }}
          >
            {formatInlineBold(trimmed)}
          </Typography>
        );
      })}
    </Stack>
  );
}
