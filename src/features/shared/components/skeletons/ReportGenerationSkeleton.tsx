import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const ReportGenerationSkeleton = () => {
  return (
    <Stack spacing={3.5}>
      {/* Header Skeleton */}
      <Stack spacing={0.5}>
        <Skeleton variant="rounded" height={32} width={220} sx={{ '&:last-child': { mb: 0.5 } }} />
        <Skeleton variant="rounded" height={20} width={500} />
      </Stack>

      <Skeleton variant="rounded" height={1} sx={{ bgcolor: 'divider' }} />

      {/* Tabs Skeleton */}
      <Stack direction="row" spacing={3}>
        <Skeleton variant="rounded" height={32} width={160} />
        <Skeleton variant="rounded" height={32} width={150} />
      </Stack>

      {/* Two Column Grid Skeleton */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' },
          gap: 4,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Generator Controls Card */}
        <Card elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3.5 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={24} width={180} />

            {/* Report Scope Radio Group */}
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={16} width={140} />
              <Stack direction="row" spacing={2} sx={{ pl: 0.5 }}>
                <Skeleton variant="rounded" height={20} width={160} />
                <Skeleton variant="rounded" height={20} width={180} />
              </Stack>
            </Stack>

            {/* Committee Selector */}
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={16} width={140} />
              <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
            </Stack>

            {/* Date Fields */}
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={16} width={120} />
              <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
            </Stack>
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={16} width={100} />
              <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
            </Stack>

            {/* Generate Button */}
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100', mt: 1 }} />
          </Stack>
        </Card>

        {/* Right Column: Report Viewer Card */}
        <Card
          elevation={0}
          sx={{
            p: 4,
            border: 1,
            borderColor: 'divider',
            borderRadius: 3.5,
            minHeight: 450,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', py: 8, spacing: 2 }}>
            <Skeleton variant="rounded" height={56} width={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={20} width={200} />
            <Skeleton variant="rounded" height={16} width={380} />
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
};

export default ReportGenerationSkeleton;