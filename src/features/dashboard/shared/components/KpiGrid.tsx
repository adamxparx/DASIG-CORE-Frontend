import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { DashboardViewMode } from '../types/dashboard.types';

interface KpiGridProps<TItem> {
  title: string;
  items: TItem[];
  viewMode: DashboardViewMode;
  gridColumns?: 2 | 3;
  renderItem: (item: TItem) => ReactNode;
}

const KpiGrid = <TItem,>({
  title,
  items,
  viewMode,
  gridColumns = 2,
  renderItem,
}: KpiGridProps<TItem>) => {
  const gridSpan = gridColumns === 3 ? 4 : 6;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {title} ({items.length} items)
      </Typography>

      <Grid container spacing={2}>
        {items.map((item, index) => (
          <Grid key={index} size={{ xs: 12, md: viewMode === 'grid' ? gridSpan : 12 }}>
            {renderItem(item)}
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default KpiGrid;
