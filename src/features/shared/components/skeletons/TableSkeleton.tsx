import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  headers?: string[];
  showPagination?: boolean;
}

const TableSkeleton = ({ rows = 5, columns = 5, headers, showPagination = true }: TableSkeletonProps) => {
  return (
    <Box>
      <TableContainer
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {(headers || Array.from({ length: columns })).map((_header, index) => (
                <TableCell key={index} sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                  <Skeleton variant="rounded" height={20} width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} sx={{ py: 2 }}>
                    <Skeleton variant="rounded" height={18} width="90%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}
        >
          <Skeleton variant="rounded" height={24} width={200} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" height={32} width={80} />
            <Skeleton variant="rounded" height={32} width={80} />
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default TableSkeleton;