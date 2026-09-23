import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const AlertsSkeleton = () => {
  return (
    <Stack spacing={3}>
      {/* Header with badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Stack spacing={0.25}>
            <Skeleton variant="rounded" height={32} width={100} />
            <Skeleton variant="rounded" height={18} width={320} />
          </Stack>
        </Stack>
        <Skeleton variant="rounded" height={32} width={140} sx={{ borderRadius: '50px' }} />
      </Box>

      {/* Search bar + filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Skeleton variant="rounded" height={40} sx={{ flex: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rounded" height={40} width={180} sx={{ bgcolor: 'grey.100' }} />
        <Skeleton variant="rounded" height={40} width={140} sx={{ bgcolor: 'grey.100' }} />
        <Skeleton variant="rounded" height={40} width={160} sx={{ bgcolor: 'grey.100' }} />
      </Stack>

      {/* Alerts Table */}
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="rounded" height={20} width="80%" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <TableCell key={colIndex} sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Skeleton variant="rounded" height={18} width="90%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Pagination Skeleton */}
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}
      >
        <Skeleton variant="rounded" height={24} width={200} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" height={32} width={80} />
          <Skeleton variant="rounded" height={32} width={80} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AlertsSkeleton;