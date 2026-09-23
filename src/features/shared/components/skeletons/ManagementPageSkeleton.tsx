import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface ManagementPageSkeletonProps {
  title?: boolean;
  subtitle?: boolean;
  formFields?: number;
  tableColumns?: number;
  tableRows?: number;
  showTableTitle?: boolean;
}

const ManagementPageSkeleton = ({
  title = true,
  subtitle = true,
  formFields = 4,
  tableColumns = 4,
  tableRows = 5,
  showTableTitle = true,
}: ManagementPageSkeletonProps) => {
  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack spacing={1}>
        {title && <Skeleton variant="rounded" height={32} width={280} />}
        {subtitle && <Skeleton variant="rounded" height={20} width={420} />}
      </Stack>

      <Skeleton variant="rounded" height={1} sx={{ bgcolor: 'divider' }} />

      {/* Form Section */}
      <Stack spacing={2.5} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2.5}>
          {Array.from({ length: formFields }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={16} width={140} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
          <Skeleton variant="rounded" height={36} width={90} />
          <Skeleton variant="rounded" height={36} width={110} />
        </Stack>
      </Stack>

      <Skeleton variant="rounded" height={1} sx={{ bgcolor: 'divider' }} />

      {/* Table List Section */}
      <Box>
        {showTableTitle && (
          <Skeleton variant="rounded" height={24} width={160} sx={{ mb: 1.5 }} />
        )}

        <Paper
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {Array.from({ length: tableColumns }).map((_, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600, color: 'text.secondary', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Skeleton variant="rounded" height={20} width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: tableRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: tableColumns }).map((_, colIndex) => (
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
          sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}
        >
          <Skeleton variant="rounded" height={24} width={200} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" height={32} width={80} />
            <Skeleton variant="rounded" height={32} width={80} />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default ManagementPageSkeleton;