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

  // Normalize newlines and split by line to ensure robust parsing
  const lines = text.split(/\r?\n/);
  
  // Define parsed block types
  type Block = 
    | { type: 'heading'; level: number; text: string }
    | { type: 'bullet_list'; items: string[] }
    | { type: 'numbered_list'; items: { num: string; text: string }[] }
    | { type: 'paragraph'; text: string };

  const blocks: Block[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: currentParagraphLines.join(' '),
      });
      currentParagraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Empty line signals end of current paragraph/block
      flushParagraph();
      continue;
    }

    // 1. Heading check: e.g. "## 1. Overall Performance Summary"
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    // 2. Bullet list check: e.g. "- item" or "* item"
    const bulletMatch = trimmed.match(/^[-*]\s*(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'bullet_list') {
        lastBlock.items.push(bulletMatch[1].trim());
      } else {
        blocks.push({
          type: 'bullet_list',
          items: [bulletMatch[1].trim()],
        });
      }
      continue;
    }

    // 3. Numbered list check: e.g. "1. item"
    const numberedMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
    if (numberedMatch) {
      flushParagraph();
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'numbered_list') {
        lastBlock.items.push({ num: numberedMatch[1], text: numberedMatch[2].trim() });
      } else {
        blocks.push({
          type: 'numbered_list',
          items: [{ num: numberedMatch[1], text: numberedMatch[2].trim() }],
        });
      }
      continue;
    }

    // 4. Otherwise, it is standard text. Group consecutive non-empty lines into a single paragraph block.
    currentParagraphLines.push(trimmed);
  }

  // Flush any final paragraph block
  flushParagraph();

  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      {blocks.map((block, blockIdx) => {
        if (block.type === 'heading') {
          const { level, text: headingText } = block;
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

        if (block.type === 'bullet_list') {
          return (
            <Stack key={blockIdx} spacing={1} sx={{ pl: 2, my: 1 }}>
              {block.items.map((item, itemIdx) => (
                <Box
                  key={itemIdx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
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
                    {formatInlineBold(item)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          );
        }

        if (block.type === 'numbered_list') {
          return (
            <Stack key={blockIdx} spacing={1} sx={{ pl: 2, my: 1 }}>
              {block.items.map((item, itemIdx) => (
                <Box
                  key={itemIdx}
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
                    {item.num}.
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                    {formatInlineBold(item.text)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          );
        }

        // Paragraph Block
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
            {formatInlineBold(block.text)}
          </Typography>
        );
      })}
    </Stack>
  );
}
