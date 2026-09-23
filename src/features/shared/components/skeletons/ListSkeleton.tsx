import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

interface ListSkeletonProps {
  items?: number;
  showHeader?: boolean;
}

const ListSkeleton = ({ items = 5, showHeader = false }: ListSkeletonProps) => {
  return (
    <Stack spacing={1.5}>
      {showHeader && (
        <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rounded" height={24} width={200} />
          </Stack>
        </Paper>
      )}
      {Array.from({ length: items }).map((_, index) => (
        <Paper key={index} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="rounded" height={20} width="40%" />
              <Skeleton variant="rounded" height={24} width={80} />
            </Stack>
            <Skeleton variant="rounded" height={16} width="95%" />
            <Skeleton variant="rounded" height={16} width="60%" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default ListSkeleton;