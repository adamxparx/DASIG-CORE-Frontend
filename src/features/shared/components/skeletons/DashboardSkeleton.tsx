import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

interface DashboardSkeletonProps {
  showBanner?: boolean;
  showFilters?: boolean;
  showCards?: boolean;
  cardCount?: number;
}

const DashboardSkeleton = ({
  showBanner = true,
  showFilters = true,
  showCards = true,
  cardCount = 6,
}: DashboardSkeletonProps) => {
  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        {/* Header Skeleton */}
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Skeleton variant="rounded" height={36} width={300} />
          <Skeleton variant="rounded" height={20} width={450} />
        </Stack>

        {/* Welcome Banner Skeleton */}
        {showBanner && (
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack spacing={1}>
                  <Skeleton variant="rounded" height={24} width={200} />
                  <Skeleton variant="rounded" height={18} width={350} />
                </Stack>
                <Skeleton variant="rounded" height={48} width={140} />
              </Stack>
              <Grid container spacing={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 3 }}>
                    <Skeleton variant="rounded" height={80} sx={{ bgcolor: 'grey.100' }} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Filter Bar Skeleton */}
        {showFilters && (
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Skeleton variant="rounded" height={40} sx={{ flex: 1, bgcolor: 'grey.100' }} />
              <Skeleton variant="rounded" height={40} width={160} sx={{ bgcolor: 'grey.100' }} />
              <Skeleton variant="rounded" height={40} width={140} sx={{ bgcolor: 'grey.100' }} />
            </Stack>
          </Card>
        )}

        {/* Cards Skeleton */}
        {showCards && (
          <Grid container spacing={2}>
            {Array.from({ length: cardCount }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Skeleton variant="rounded" height={24} width="60%" />
                        <Skeleton variant="circular" width={20} height={20} />
                      </Stack>
                      <Skeleton variant="rounded" height={14} width="80%" />
                      <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'grey.100' }} />
                      <Skeleton variant="rounded" height={6} sx={{ bgcolor: 'grey.100' }} />
                      <Stack direction="row" spacing={1}>
                        <Skeleton variant="rounded" height={18} width={100} />
                        <Skeleton variant="rounded" height={18} width={60} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default DashboardSkeleton;