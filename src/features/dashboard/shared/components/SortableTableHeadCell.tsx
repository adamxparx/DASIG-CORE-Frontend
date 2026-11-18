import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import type { TableCellProps } from '@mui/material/TableCell';
import type { SortDirection } from '../hooks/useTableSort';

const headerCellSx: TableCellProps['sx'] = {
  fontWeight: 600,
  color: 'text.secondary',
  borderBottom: 1,
  borderColor: 'divider',
  whiteSpace: 'nowrap',
};

interface SortableTableHeadCellProps {
  label: string;
  columnKey: string;
  sortKey: string | null;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: TableCellProps['align'];
}

/**
 * A table header cell that shows a single arrow beside its label.
 * Defaults to a down arrow (descending/most latest) when not sorting.
 * Toggles between up and down when the column title is clicked.
 */
const SortableTableHeadCell = ({
  label,
  columnKey,
  sortKey,
  direction,
  onSort,
  align,
}: SortableTableHeadCellProps) => {
  const isActive = sortKey === columnKey;
  const showArrow = isActive ? direction : 'desc';

  const ArrowIcon = showArrow === 'asc' ? ArrowDropUp : ArrowDropDown;

  return (
    <TableCell align={align} sortDirection={isActive ? direction : false} sx={headerCellSx}>
      <Box
        component="button"
        type="button"
        onClick={() => onSort(columnKey)}
        aria-label={`Sort by ${label}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          border: 0,
          bgcolor: 'transparent',
          p: 0,
          m: 0,
          cursor: 'pointer',
          font: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          color: 'inherit',
          '&:hover': { color: 'text.primary' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 1 },
        }}
      >
        <Box component="span" sx={{ lineHeight: 1 }}>
          {label}
        </Box>
        <ArrowIcon sx={{ fontSize: 18, opacity: 1 }} />
      </Box>
    </TableCell>
  );
};

export default SortableTableHeadCell;