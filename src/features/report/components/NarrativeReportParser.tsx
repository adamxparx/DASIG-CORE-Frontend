import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

interface NarrativeReportParserProps {
  text: string;
}

const INLINE_FORMAT_PATTERN = /\*\*(.+?)\*\*|\*(.+?)\*/g;

/**
 * Robust inline formatter for **bold** and *italic* markdown spans.
 * Scans the string for both marker types and renders each segment with the matching style.
 */
function formatInlineBold(text: string): ReactNode[] | string {
  if (!text.includes('*')) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_FORMAT_PATTERN)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <Box component="span" key={key++} sx={{ fontWeight: 700, color: 'text.primary' }}>
          {match[1]}
        </Box>
      );
    } else {
      nodes.push(
        <Box component="span" key={key++} sx={{ fontStyle: 'italic' }}>
          {match[2]}
        </Box>
      );
    }
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
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
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'paragraph'; text: string };

  const isTableRow = (line: string) => line.length > 1 && line.startsWith('|') && line.endsWith('|');
  const isTableSeparatorRow = (line: string) => isTableRow(line) && /^[|:\-\s]+$/.test(line);
  const splitTableRow = (line: string) => line.slice(1, -1).split('|').map((cell) => cell.trim());

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

    // 0. Markdown table check. The LLM doesn't always emit a clean |---|---| separator row, and
    // sometimes wraps a single logical row across multiple physical lines mid-cell, so join lines
    // into logical rows until each one actually ends with '|'.
    if (trimmed.startsWith('|')) {
      flushParagraph();
      const rawRows: string[] = [];
      let rowBuffer = '';
      let continuationCount = 0;
      let j = i;
      while (j < lines.length) {
        const candidate = lines[j].trim();
        if (!rowBuffer) {
          if (!candidate || !candidate.startsWith('|')) break; // left the table
          rowBuffer = candidate;
          continuationCount = 0;
        } else {
          if (!candidate) break; // unterminated row; stop rather than swallow the rest of the text
          rowBuffer += ` ${candidate}`;
          continuationCount++;
        }
        j++;
        if (rowBuffer.endsWith('|') || continuationCount >= 6) {
          rawRows.push(rowBuffer);
          rowBuffer = '';
        }
      }
      if (rowBuffer) {
        rawRows.push(rowBuffer);
      }

      const headers = splitTableRow(rawRows[0]);
      const bodyStart = rawRows.length > 1 && isTableSeparatorRow(rawRows[1]) ? 2 : 1;
      const rows = rawRows.slice(bodyStart).map(splitTableRow);
      blocks.push({ type: 'table', headers, rows });
      i = j - 1; // loop's i++ will land right after the table
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

    // 3. Numbered heading check: e.g. "1. Overall Performance Summary" — short, no ending
    // punctuation, per the report's required top-level section structure.
    const numberedHeadingMatch = trimmed.match(/^\d+\.\s+([^.!?]+)$/);
    if (numberedHeadingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: 2,
        text: numberedHeadingMatch[1].trim(),
      });
      continue;
    }

    // 3b. Numbered list check: e.g. "1. Ensure timely submissions."
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
                {formatInlineBold(headingText)}
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

        if (block.type === 'table') {
          return (
            <TableContainer
              key={blockIdx}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, my: 1 }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                  <TableRow>
                    {block.headers.map((header, headerIdx) => (
                      <TableCell key={headerIdx} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {formatInlineBold(header)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {block.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {block.headers.map((_, cellIdx) => (
                        <TableCell key={cellIdx} sx={{ color: 'text.secondary', verticalAlign: 'top' }}>
                          {formatInlineBold(row[cellIdx] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
