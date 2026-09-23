import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
}

const FormSkeleton = ({ fields = 5, showTitle = true }: FormSkeletonProps) => {
  return (
    <Stack spacing={3}>
      {showTitle && (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={32} width={250} />
          <Skeleton variant="rounded" height={20} width={400} />
        </Stack>
      )}

      <Stack spacing={2.5}>
        {Array.from({ length: fields }).map((_, index) => (
          <Stack key={index} spacing={1}>
            <Skeleton variant="rounded" height={16} width={120} />
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'grey.100' }} />
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Skeleton variant="rounded" height={40} width={100} />
        <Skeleton variant="rounded" height={40} width={120} />
      </Stack>
    </Stack>
  );
};

export default FormSkeleton;