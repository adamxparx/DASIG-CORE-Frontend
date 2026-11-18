import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import PageBreadcrumbs from './PageBreadcrumbs';

interface AdminFormPageShellProps {
  title: string;
  description?: string;
  breadcrumbItems: { label: string; href?: string }[];
  actions?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}

/**
 * Layout for the create/edit pages in the admin area.
 *
 * The header (breadcrumb + title + description + action buttons) stays fixed while only the
 * form body below it scrolls, so primary actions are always reachable.
 */
const AdminFormPageShell = ({ title, description, breadcrumbItems, actions, banner, children }: AdminFormPageShellProps) => {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        pt: 2,
        pb: { xs: 2, md: 3 },
        height: 'calc(100dvh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <PageBreadcrumbs items={breadcrumbItems} />

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {banner}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {description}
              </Typography>
            )}
          </Box>
          {actions ? (
            <Stack direction="row" spacing={1.5} sx={{ ml: 'auto', alignItems: 'center' }}>
              {actions}
            </Stack>
          ) : null}
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminFormPageShell;