import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSession } from '../../../auth/utils/session';
import { dashboardService } from '../api/dashboardService';
import type { DashboardKpiItem } from '../types/dashboard.types';
import { useDashboardShell } from './DashboardShellContext';

const KPI_DETAIL_PATTERN = /^\/dashboard\/admin\/kpis\/\d+$/;

const DashboardUserHeader = () => {
  const { setMobileOpen } = useDashboardShell();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  const isKpiDetail = KPI_DETAIL_PATTERN.test(location.pathname);
  const kpiIdMatch = location.pathname.match(/\/kpis\/(\d+)$/);
  const kpiId = kpiIdMatch ? Number(kpiIdMatch[1]) : null;

  const [kpiName, setKpiName] = useState<string | null>(null);

  useEffect(() => {
    if (kpiId == null) {
      return;
    }
    let active = true;
    dashboardService
      .getDashboard()
      .then((data) => {
        const found = data.kpis.find((k: DashboardKpiItem) => k.id === kpiId);
        if (active) {
          setKpiName(found?.name ?? 'KPI Details');
        }
      })
      .catch(() => {
        if (active) {
          setKpiName('KPI Details');
        }
      });
    return () => {
      active = false;
    };
  }, [kpiId]);

  if (!session) {
    return null;
  }

  const displayName = session.payload.name ?? session.payload.sub ?? 'User';

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        pt: 2,
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      {isKpiDetail ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <IconButton
            onClick={() => navigate('/dashboard/admin')}
            size="small"
            aria-label="Back to KPI Management Hub"
            sx={{ color: 'text.secondary', flexShrink: 0 }}
          >
            <ArrowBackOutlinedIcon fontSize="small" />
          </IconButton>
          <Breadcrumbs separator="/" sx={{ fontSize: '0.875rem', minWidth: 0 }}>
            <Link
              href="/dashboard/admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard/admin');
              }}
              variant="body2"
              sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              KPI Management Hub
            </Link>
            <Typography variant="body2" noWrap sx={{ color: 'text.primary', fontWeight: 600 }}>
              {kpiName ?? 'KPI Details'}
            </Typography>
          </Breadcrumbs>
        </Stack>
      ) : (
        <IconButton
          onClick={() => setMobileOpen(true)}
          size="small"
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            color: 'text.secondary',
          }}
        >
          <MenuOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <Typography
        variant="body1"
        noWrap
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          lineHeight: 1.4,
          textAlign: 'right',
          ml: 'auto',
        }}
      >
        Welcome, {displayName}
      </Typography>
    </Box>
  );
};

export default DashboardUserHeader;
