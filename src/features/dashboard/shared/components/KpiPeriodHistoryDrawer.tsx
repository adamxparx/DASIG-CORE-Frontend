import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ApiError } from '../../../../lib/api/client';
import { dashboardService } from '../api/dashboardService';
import type { DashboardKpiItem, KpiPeriodHistoryResponse, UserRole } from '../types/dashboard.types';
import KpiStatusBadge from './KpiStatusBadge';
import type { DashboardStatus } from '../types/dashboard.types';

interface KpiPeriodHistoryDrawerProps {
  open: boolean;
  kpi: DashboardKpiItem | null;
  role: UserRole;
  onClose: () => void;
}

const mapPerformanceStatus = (status: string): DashboardStatus => {
  if (status === 'GREEN') return 'ON_TRACK';
  if (status === 'YELLOW') return 'AT_RISK';
  return 'DELAYED';
};

const formatSubmissionType = (type: 'INTERNAL' | 'FINAL', role: UserRole) => {
  if (type === 'INTERNAL') {
    return role === 'STAFF' ? 'Staff submission' : 'Staff (internal)';
  }
  return 'TBI final';
};

const formatDate = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ChartSeriesKey = 'INTERNAL' | 'FINAL';

interface ChartPoint {
  period: string;
  current: boolean;
  expectedValue: number;
  internalValue: number | null;
  finalValue: number | null;
}

const chartSeriesConfig: Record<ChartSeriesKey | 'EXPECTED', { label: string; color: string }> = {
  EXPECTED: { label: 'Expected target', color: '#64748B' },
  INTERNAL: { label: 'Staff internal progress', color: '#2563EB' },
  FINAL: { label: 'TBI final progress', color: '#059669' },
};

const getChartSeriesKeys = (role: UserRole): ChartSeriesKey[] => {
  if (role === 'DASIG_ADMIN') return ['FINAL'];
  if (role === 'STAFF') return ['INTERNAL'];
  return ['INTERNAL', 'FINAL'];
};

const buildChartPoints = (history: KpiPeriodHistoryResponse): ChartPoint[] => {
  const chronologicalPeriods = [...history.periods].reverse();
  const periodCount = Math.max(chronologicalPeriods.length, 1);
  let internalCumulative = 0;
  let finalCumulative = 0;

  return chronologicalPeriods.map((period, index) => {
    const internalSubmission = period.submissions.find((submission) => submission.submissionType === 'INTERNAL');
    const finalSubmission = period.submissions.find((submission) => submission.submissionType === 'FINAL');

    if (internalSubmission) {
      internalCumulative += internalSubmission.submittedValue;
    }
    if (finalSubmission) {
      finalCumulative += finalSubmission.submittedValue;
    }

    return {
      period: period.reportingPeriod,
      current: period.current,
      expectedValue: history.targetValue * ((index + 1) / periodCount),
      internalValue: internalCumulative > 0 ? internalCumulative : null,
      finalValue: finalCumulative > 0 ? finalCumulative : null,
    };
  });
};

const formatChartValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 1 });

const KpiProgressChart = ({ history, role }: { history: KpiPeriodHistoryResponse; role: UserRole }) => {
  const points = buildChartPoints(history);
  const visibleSeries = getChartSeriesKeys(role);
  const chartWidth = 760;
  const chartHeight = 280;
  const padding = { top: 24, right: 28, bottom: 58, left: 70 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const maxActualValue = Math.max(
    0,
    ...points.flatMap((point) => [point.internalValue ?? 0, point.finalValue ?? 0])
  );
  const maxValue = Math.max(history.targetValue, maxActualValue, 1);
  const yMax = maxValue * 1.12;
  const yTicks = [0, yMax / 2, yMax];

  const getX = (index: number) =>
    padding.left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const getY = (value: number) => padding.top + plotHeight - (value / yMax) * plotHeight;

  const buildPath = (values: Array<number | null>) =>
    values
      .map((value, index) => {
        if (value === null) return null;
        return `${index === values.findIndex((entry) => entry !== null) ? 'M' : 'L'} ${getX(index)} ${getY(value)}`;
      })
      .filter(Boolean)
      .join(' ');

  const expectedPath = buildPath(points.map((point) => point.expectedValue));
  const seriesPaths = visibleSeries.map((series) => ({
    series,
    path: buildPath(points.map((point) => (series === 'INTERNAL' ? point.internalValue : point.finalValue))),
  }));

  if (points.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        boxShadow: '0 14px 35px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
            Cumulative progress by period
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Compares actual submitted progress against the expected target timeline.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Chip
            label={chartSeriesConfig.EXPECTED.label}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: chartSeriesConfig.EXPECTED.color, fontWeight: 600 }}
          />
          {visibleSeries.map((series) => (
            <Chip
              key={series}
              label={chartSeriesConfig[series].label}
              size="small"
              sx={{ bgcolor: '#F8FAFC', color: chartSeriesConfig[series].color, fontWeight: 600 }}
            />
          ))}
        </Stack>
      </Stack>

      <Box sx={{ width: '100%', overflowX: 'auto', px: 1, pb: 1 }}>
        <Box
          component="svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="KPI cumulative progress chart"
          sx={{ display: 'block', width: '100%', minWidth: 680, height: 'auto' }}
        >
          <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="18" fill="#FFFFFF" />
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#E5E7EB" />
                <text x={padding.left - 12} y={y + 4} textAnchor="end" fontSize="12" fill="#64748B">
                  {formatChartValue(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            x2={chartWidth - padding.right}
            y1={padding.top + plotHeight}
            y2={padding.top + plotHeight}
            stroke="#CBD5E1"
          />
          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke="#CBD5E1"
          />

          <path d={expectedPath} fill="none" stroke={chartSeriesConfig.EXPECTED.color} strokeWidth="3" strokeDasharray="8 8" />
          {seriesPaths.map(
            ({ series, path }) =>
              path && (
                <path
                  key={series}
                  d={path}
                  fill="none"
                  stroke={chartSeriesConfig[series].color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
          )}

          {points.map((point, index) => {
            const x = getX(index);
            return (
              <g key={point.period}>
                {point.current && (
                  <line
                    x1={x}
                    x2={x}
                    y1={padding.top}
                    y2={padding.top + plotHeight}
                    stroke="#2563EB"
                    strokeDasharray="5 6"
                    opacity="0.55"
                  />
                )}
                <circle cx={x} cy={getY(point.expectedValue)} r="4" fill="#FFFFFF" stroke={chartSeriesConfig.EXPECTED.color} strokeWidth="2" />
                {visibleSeries.map((series) => {
                  const value = series === 'INTERNAL' ? point.internalValue : point.finalValue;
                  if (value === null) return null;
                  return (
                    <circle
                      key={series}
                      cx={x}
                      cy={getY(value)}
                      r="5"
                      fill="#FFFFFF"
                      stroke={chartSeriesConfig[series].color}
                      strokeWidth="3"
                    />
                  );
                })}
                <text
                  x={x}
                  y={chartHeight - 28}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={point.current ? 700 : 500}
                  fill={point.current ? '#1D4ED8' : '#475569'}
                >
                  {point.period}
                </text>
                {point.current && (
                  <text x={x} y={chartHeight - 12} textAnchor="middle" fontSize="11" fill="#2563EB">
                    Current
                  </text>
                )}
              </g>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const KpiPeriodHistoryDrawer = ({ open, kpi, role, onClose }: KpiPeriodHistoryDrawerProps) => {
  const [history, setHistory] = useState<KpiPeriodHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !kpi) {
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getKpiPeriodHistory(kpi.id);
        setHistory(response);
      } catch (err) {
        setHistory(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load period history.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [open, kpi]);

  const handleClose = () => {
    setHistory(null);
    setError(null);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 760, md: 900 }, p: 0, bgcolor: '#F8FAFC' } },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 2.5, pb: 2 }}
        >
          <Box sx={{ pr: 2 }}>
            <Typography variant="overline" sx={{ color: '#6B7280', letterSpacing: 1 }}>
              Period history
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2329' }}>
              {kpi?.name ?? 'KPI'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {kpi?.organization}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} aria-label="Close period history">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          {isLoading && (
            <Stack sx={{ py: 6, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {!isLoading && !error && history && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Total target: ${formatMetricValue(history.targetValue)} ${history.unit}`} size="small" />
                <Chip label={`Deadline: ${formatDate(history.deadline)}`} size="small" />
                {history.currentPeriod && (
                  <Chip label={`Current: ${history.currentPeriod}`} size="small" color="primary" variant="outlined" />
                )}
              </Stack>

              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {role === 'DASIG_ADMIN'
                  ? 'Official TBI final submissions by reporting period.'
                  : role === 'STAFF'
                    ? 'Your organization’s staff submissions by reporting period.'
                    : 'Staff internal drafts and TBI final submissions by period.'}
              </Typography>

              <KpiProgressChart history={history} role={role} />

              <Box
                sx={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: '1px solid #E5E7EB',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                      Period submission records
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Exact submitted values used for the chart and dashboard status.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${history.periods.length} periods`}
                    size="small"
                    sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table
                    size="small"
                    sx={{
                      minWidth: 780,
                      '& th': {
                        borderBottom: '1px solid #E5E7EB',
                        bgcolor: '#F8FAFC',
                        color: '#64748B',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        py: 1.25,
                      },
                      '& td': {
                        borderBottom: '1px solid #EEF2F7',
                        py: 1.5,
                      },
                      '& tbody tr:last-child td': {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Period</TableCell>
                        <TableCell>Submission</TableCell>
                        <TableCell>Submitted by</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Achievement</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.periods.map((period) =>
                        period.submissions.length === 0 ? (
                          <TableRow
                            key={period.reportingPeriod}
                            sx={{
                              bgcolor: period.current ? '#EFF6FF' : '#FFFFFF',
                              opacity: period.current ? 1 : 0.9,
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600, color: '#111827' }}>
                                  {period.reportingPeriod}
                                </Typography>
                                {period.current && (
                                  <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell colSpan={5}>
                              <Box
                                sx={{
                                  border: '1px dashed #CBD5E1',
                                  borderRadius: 2,
                                  bgcolor: '#F8FAFC',
                                  px: 1.5,
                                  py: 1,
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                                  No submission recorded for this period
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          period.submissions.map((submission, index) => (
                            <TableRow
                              key={`${period.reportingPeriod}-${submission.id}`}
                              sx={{
                                bgcolor: period.current ? '#EFF6FF' : index % 2 === 0 ? '#FFFFFF' : '#FBFDFF',
                                '&:hover': { bgcolor: period.current ? '#DBEAFE' : '#F8FAFC' },
                              }}
                            >
                              <TableCell>
                                {index === 0 ? (
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: period.current ? 800 : 600, color: '#111827' }}>
                                      {period.reportingPeriod}
                                    </Typography>
                                    {period.current && (
                                      <Chip
                                        label="Current"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 22 }}
                                      />
                                    )}
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                                    same period
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatSubmissionType(submission.submissionType, role)}
                                  size="small"
                                  sx={{
                                    bgcolor: submission.submissionType === 'FINAL' ? '#ECFDF5' : '#EFF6FF',
                                    color: submission.submissionType === 'FINAL' ? '#047857' : '#1D4ED8',
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                                    {submission.submittedByName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    {submission.submittedByRole.replaceAll('_', ' ')}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                                  {formatMetricValue(submission.submittedValue)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {history.unit}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 700 }}>
                                  {formatMetricValue(submission.achievementRate)}%
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <KpiStatusBadge status={mapPerformanceStatus(submission.performanceStatus)} />
                              </TableCell>
                            </TableRow>
                          ))
                        )
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              {history.periods.length === 0 && (
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  No reporting periods are configured for this KPI yet.
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
};

export default KpiPeriodHistoryDrawer;