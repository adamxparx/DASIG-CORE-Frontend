import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

interface AdminPageSkeletonProps {
  showHeader?: boolean;
  showForm?: boolean;
  showList?: boolean;
  listItems?: number;
  formFields?: number;
}

const AdminPageSkeleton = ({
  showHeader = true,
  showForm = true,
  showList = true,
  listItems = 5,
  formFields = 4,
}: AdminPageSkeletonProps) => {
  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Header Skeleton */}
        {showHeader && (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={32} width={280} />
            <Skeleton variant="rounded" height={20} width={420} />
          </Stack>
        )}

        {/* Form Skeleton */}
        {showForm && (
          <Stack spacing={2.5} sx={{ p: 2 }}>
            {Array.from({ length: formFields }).map((_, index) => (
              <Stack key={index} spacing={1}>
                <Skeleton variant="rounded" height={16} width={140} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
              </Stack>
            ))}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
              <Skeleton variant="rounded" height={36} width={90} />
              <Skeleton variant="rounded" height={36} width={110} />
            </Stack>
          </Stack>
        )}

        {/* List Skeleton */}
        {showList && (
          <Stack spacing={1.5}>
            {Array.from({ length: listItems }).map((_, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, alignItems: 'center' }}
              >
                <Skeleton variant="rounded" height={40} width={40} />
                <Stack sx={{ flex: 1 }}>
                  <Skeleton variant="rounded" height={18} width="40%" />
                  <Skeleton variant="rounded" height={14} width="60%" />
                </Stack>
                <Skeleton variant="rounded" height={32} width={80} />
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default AdminPageSkeleton;