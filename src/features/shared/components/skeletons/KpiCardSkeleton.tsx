import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

interface KpiCardSkeletonProps {
  count?: number;
}

const KpiCardSkeleton = ({ count = 6 }: KpiCardSkeletonProps) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Skeleton variant="rounded" height={28} width="70%" />
                    <Skeleton variant="rounded" height={16} width="90%" />
                  </Stack>
                  <Skeleton variant="circular" width={24} height={24} />
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Skeleton variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                  <Skeleton variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'grey.100' }} />
                </Stack>

                <Skeleton variant="rounded" height={8} sx={{ bgcolor: 'grey.100' }} />

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Skeleton variant="rounded" height={20} width={120} />
                  <Skeleton variant="rounded" height={20} width={80} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCardSkeleton;