import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useState } from 'react';
import type { DashboardKpiItem } from '../types/dashboard.types';
import { computeKpiStatus } from '../utils/kpiStatusUtils';
import KpiAdminActions from '../../admin/components/KpiAdminActions';
import KpiStatusBadge from './KpiStatusBadge';
import TablePaginationBar, { TABLE_PAGE_SIZE } from './TablePaginationBar';

interface KpisListProps {
  kpis: DashboardKpiItem[];
  selectedId: number | null;
  onSelectKpi: (kpi: DashboardKpiItem) => void;
  onEditKpi?: (kpi: DashboardKpiItem) => void;
  onDeleteKpi?: (kpi: DashboardKpiItem) => void;
  onArchiveKpi?: (kpi: DashboardKpiItem) => void;
  onUnarchiveKpi?: (kpi: DashboardKpiItem) => void;
  title?: string | null;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KpisList = ({
  kpis,
  selectedId,
  onSelectKpi,
  onEditKpi,
  onDeleteKpi,
  onArchiveKpi,
  onUnarchiveKpi,
  title = null,
  hasActiveFilters = false,
  onResetFilters,
}: KpisListProps) => {
  const hasAdminActions = Boolean(onEditKpi ?? onDeleteKpi ?? onArchiveKpi ?? onUnarchiveKpi);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(kpis.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedKpis = kpis.slice((safePage - 1) * TABLE_PAGE_SIZE, safePage * TABLE_PAGE_SIZE);

  return (
    <Box>
      {Boolean(title) && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
                KPI Title
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Overall Target
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Overall Progress
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}
              >
                Deadline
              </TableCell>
              {hasAdminActions && (
                <TableCell
                  sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 1, borderColor: 'divider', width: 96 }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {kpis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={hasAdminActions ? 6 : 5} sx={{ border: 0, py: 6 }}>
                  {hasActiveFilters ? (
                    <Stack
                      spacing={1.5}
                      sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 2 }}
                    >
                      <FilterAltOffOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        No KPIs match the selected filters
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
                        Try adjusting your search keywords, committee, or status filter.
                      </Typography>
                      {onResetFilters && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={onResetFilters}
                          startIcon={<RestartAltIcon />}
                          sx={{
                            mt: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        >
                          Clear all filters
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <Typography align="center" color="text.secondary">
                      {title === 'Archived KPIs'
                        ? 'There are no archived KPIs yet.'
                        : 'There are no existing KPIs yet.'}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pagedKpis.map((kpi) => {
                const isSelected = selectedId === kpi.id;
                const overallTargetValue = kpi.overallTargetValue ?? kpi.targetValue;
                const progressPercent = overallTargetValue > 0 ? (kpi.submittedValue / overallTargetValue) * 100 : 0;
                const status = computeKpiStatus(kpi.submittedValue, overallTargetValue, kpi.deadline);

                return (
                  <TableRow
                    key={kpi.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.hover' : 'transparent',
                      outline: isSelected ? 2 : 'none',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                      '& td': {
                        borderBottom: 1,
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <TableCell
                      onClick={() => onSelectKpi(kpi)}
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{kpi.name}</span>
                        {(kpi.archived || kpi.kpiStatus === 'ARCHIVED') && (
                          <Chip
                            label="Archived"
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#5F6368',
                              color: '#5F6368',
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatMetricValue(overallTargetValue)} {kpi.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {progressPercent.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <KpiStatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {formatDate(kpi.deadline)}
                      </Typography>
                    </TableCell>
                    {hasAdminActions && (
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        <KpiAdminActions
                          isArchived={Boolean(kpi.archived || kpi.kpiStatus === 'ARCHIVED')}
                          onEdit={onEditKpi ? () => onEditKpi(kpi) : undefined}
                          onDelete={onDeleteKpi ? () => onDeleteKpi(kpi) : undefined}
                          onArchive={onArchiveKpi ? () => onArchiveKpi(kpi) : undefined}
                          onUnarchive={onUnarchiveKpi ? () => onUnarchiveKpi(kpi) : undefined}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationBar total={kpis.length} page={safePage} onPageChange={setPage} />
    </Box>
  );
};

export default KpisList;
