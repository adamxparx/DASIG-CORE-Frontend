import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { KpiPeriodHistoryResponse, UserRole } from '../types/dashboard.types';

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
    const internalSubmittedValue = period.submissions
      .filter((submission) => submission.submissionType === 'INTERNAL')
      .reduce((total, submission) => total + submission.submittedValue, 0);
    const finalSubmittedValue = period.submissions
      .filter((submission) => submission.submissionType === 'FINAL')
      .reduce((total, submission) => total + submission.submittedValue, 0);

    if (internalSubmittedValue > 0) {
      internalCumulative += internalSubmittedValue;
    }
    if (finalSubmittedValue > 0) {
      finalCumulative += finalSubmittedValue;
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

export default KpiProgressChart;
