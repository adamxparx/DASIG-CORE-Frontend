import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const KpiDetailSkeleton = () => {
  return (
    <Stack spacing={3}>
      {/* Header Skeleton */}
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={36} width="60%" />
        <Skeleton variant="rounded" height={20} width="80%" />
      </Stack>

      {/* Action Buttons Skeleton */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Skeleton variant="rounded" height={36} width={90} />
        <Skeleton variant="rounded" height={36} width={110} />
        <Skeleton variant="rounded" height={36} width={110} />
      </Stack>

      {/* Main Info Card Skeleton */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" height={28} width={120} />
            <Skeleton variant="rounded" height={28} width={100} />
            <Skeleton variant="rounded" height={28} width={90} />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Skeleton variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'grey.100' }} />
            <Skeleton variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'grey.100' }} />
            <Skeleton variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'grey.100' }} />
          </Stack>

          <Skeleton variant="rounded" height={8} sx={{ bgcolor: 'grey.100', maxWidth: '40%' }} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rounded" height={20} width={140} />
            <Skeleton variant="rounded" height={20} width={100} />
          </Stack>
        </Stack>
      </Card>

      {/* History Section Skeleton */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={28} width={200} />
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={2} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Skeleton variant="rounded" height={40} width={40} />
                <Stack sx={{ flex: 1 }}>
                  <Skeleton variant="rounded" height={18} width="30%" />
                  <Skeleton variant="rounded" height={14} width="50%" />
                </Stack>
                <Skeleton variant="rounded" height={32} width={80} />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default KpiDetailSkeleton;