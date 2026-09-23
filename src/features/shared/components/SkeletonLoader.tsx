import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

interface SkeletonLoaderProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  variant?: 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | false;
  gap?: number;
  sx?: SxProps<Theme>;
  direction?: 'row' | 'column';
  itemSx?: SxProps<Theme>;
}

const SkeletonLoader = ({
  count = 1,
  height = 20,
  width = '100%',
  variant = 'rounded',
  animation = 'pulse',
  gap = 1,
  sx,
  direction = 'column',
  itemSx,
}: SkeletonLoaderProps) => {
  return (
    <Stack direction={direction} spacing={gap} sx={sx}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          animation={animation}
          height={height}
          width={width}
          sx={itemSx}
        />
      ))}
    </Stack>
  );
};

export default SkeletonLoader;