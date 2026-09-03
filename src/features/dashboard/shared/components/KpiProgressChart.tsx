import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { KpiPeriodHistoryResponse, UserRole } from '../types/dashboard.types';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartSeriesKey = 'INTERNAL' | 'FINAL';
type ChartViewFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME';

interface ChartPoint {
  label: string;
  current: boolean;
  isDeadline: boolean;
  expectedValue: number;
  internalValue: number | null;
  finalValue: number | null;
}

interface ChartViewOption {
  value: ChartViewFrequency;
  label: string;
  axisLegend: string;
}

interface BucketEntry {
  internal: number;
  final: number;
  hasInternal: boolean;
  hasFinal: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const VIEW_OPTIONS: ChartViewOption[] = [
  { value: 'WEEKLY', label: 'Weekly', axisLegend: 'Weekly Timeline' },
  { value: 'MONTHLY', label: 'Monthly', axisLegend: 'Monthly Timeline' },
  { value: 'QUARTERLY', label: 'Quarterly', axisLegend: 'Quarterly Timeline' },
  { value: 'ANNUAL', label: 'Annual', axisLegend: 'Annual Timeline' },
  { value: 'ONE_TIME', label: 'One-Time (Total)', axisLegend: 'Overall Timeline' },
];

const chartSeriesConfig: Record<ChartSeriesKey, { label: string; color: string; dotColor?: string }> = {
  INTERNAL: { label: 'Staff internal progress', color: '#2563EB', dotColor: '#2563EB' },
  FINAL: { label: 'Official final progress', color: '#059669', dotColor: '#059669' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getChartSeriesKeys = (role: UserRole): ChartSeriesKey[] => {
  if (role === 'DASIG_ADMIN') return ['FINAL'];
  if (role === 'STAFF') return ['FINAL'];
  return ['INTERNAL', 'FINAL'];
};

const getIsoWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const getBucketLabel = (dateStr: string, freq: ChartViewFrequency): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  switch (freq) {
    case 'WEEKLY': {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      d.setDate(d.getDate() - dayOfWeek);
      const weekNum = getIsoWeekNumber(d);
      const monthStr = MONTH_NAMES[d.getMonth()];
      const dayStr = d.getDate();
      const yearShort = String(d.getFullYear()).slice(2);
      return `W${weekNum} (${monthStr} ${dayStr}, '${yearShort})`;
    }
    case 'MONTHLY':
      return `${MONTH_NAMES[month]} ${year}`;
    case 'QUARTERLY':
      return `Q${Math.floor(month / 3) + 1} ${year}`;
    case 'ANNUAL':
      return String(year);
    case 'ONE_TIME':
      return 'Overall';
  }
};

const isCurrentBucket = (label: string, freq: ChartViewFrequency): boolean => {
  const now = new Date();
  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentLabel = getBucketLabel(localNow.toISOString(), freq);
  return label === currentLabel;
};

const generateFullTimeline = (startDate: Date, deadlineDate: Date, freq: ChartViewFrequency): string[] => {
  if (freq === 'ONE_TIME') return ['Overall'];

  const labels: string[] = [];
  const cursor = new Date(startDate);

  if (freq === 'WEEKLY') {
    const dayOfWeek = (cursor.getDay() + 6) % 7;
    cursor.setDate(cursor.getDate() - dayOfWeek);
  } else if (freq === 'MONTHLY') {
    cursor.setDate(1);
  } else if (freq === 'QUARTERLY') {
    cursor.setMonth(Math.floor(cursor.getMonth() / 3) * 3, 1);
  } else if (freq === 'ANNUAL') {
    cursor.setMonth(0, 1);
  }

  while (cursor <= deadlineDate) {
    const label = getBucketLabel(cursor.toISOString(), freq);
    if (!labels.includes(label)) {
      labels.push(label);
    }
    if (freq === 'WEEKLY') {
      cursor.setDate(cursor.getDate() + 7);
    } else if (freq === 'MONTHLY') {
      cursor.setMonth(cursor.getMonth() + 1);
    } else if (freq === 'QUARTERLY') {
      cursor.setMonth(cursor.getMonth() + 3);
    } else {
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
  }

  const deadlineLabel = getBucketLabel(deadlineDate.toISOString(), freq);
  if (!labels.includes(deadlineLabel)) labels.push(deadlineLabel);

  return labels;
};

/**
 * Re-groups all submissions by submission date into chosen frequency buckets.
 * - Expected target ramps across the FULL timeline (start date to deadline).
 * - Actual submissions ONLY populate the specific buckets that contain submissions.
 *   They do NOT project flat into future, unsubmitted periods.
 */
const buildChartPointsByFrequency = (
  history: KpiPeriodHistoryResponse,
  freq: ChartViewFrequency
): ChartPoint[] => {
  const allSubmissions = history.periods.flatMap((p) => p.submissions);

  const bucketMap = new Map<string, BucketEntry>();
  for (const sub of allSubmissions) {
    const label = getBucketLabel(sub.submissionDate, freq);
    const existing = bucketMap.get(label) ?? {
      internal: 0,
      final: 0,
      hasInternal: false,
      hasFinal: false,
    };
    if (sub.submissionType === 'INTERNAL') {
      existing.internal += sub.submittedValue;
      existing.hasInternal = true;
    } else {
      existing.final += sub.submittedValue;
      existing.hasFinal = true;
    }
    bucketMap.set(label, existing);
  }

  // Determine timeline boundary dates
  const deadlineDate = new Date(history.deadline + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // End date is at least the deadline or today, extended by any late submissions
  let maxTimelineDate = deadlineDate > today ? deadlineDate : today;
  if (allSubmissions.length > 0) {
    const latest = allSubmissions.reduce((max, s) =>
      s.submissionDate > max ? s.submissionDate : max,
      allSubmissions[0].submissionDate
    );
    const latestDate = new Date(latest + 'T00:00:00');
    if (latestDate > maxTimelineDate) {
      maxTimelineDate = latestDate;
    }
  }

  // Minimum context window (Option 1): guarantees the chart shows a meaningful timeline
  // leading up to the deadline and current period, rather than collapsing into 1 point.
  const getMinContextStartDate = (endDate: Date, f: ChartViewFrequency): Date => {
    const d = new Date(endDate);
    switch (f) {
      case 'WEEKLY':
        // Show at least 7 weeks prior (8 weeks total)
        d.setDate(d.getDate() - 7 * 7);
        return d;
      case 'MONTHLY':
        // Show at least 5 months prior (6 months total)
        d.setMonth(d.getMonth() - 5);
        return d;
      case 'QUARTERLY':
        // Show at least 3 quarters prior (1 year total)
        d.setMonth(d.getMonth() - 9);
        return d;
      case 'ANNUAL':
        // Show at least 2 years prior (3 years total)
        d.setFullYear(d.getFullYear() - 2);
        return d;
      case 'ONE_TIME':
        return d;
    }
  };

  const minWindowStart = getMinContextStartDate(maxTimelineDate, freq);
  let startDate = minWindowStart;

  if (allSubmissions.length > 0) {
    const earliest = allSubmissions.reduce((min, s) =>
      s.submissionDate < min ? s.submissionDate : min,
      allSubmissions[0].submissionDate
    );
    const earliestDate = new Date(earliest + 'T00:00:00');
    // If an actual submission was even earlier than the minimum window, expand back to it
    if (earliestDate < startDate) {
      startDate = earliestDate;
    }
  }

  // Generate full timeline buckets from start to deadline (or latest submission / today)
  const allLabels = generateFullTimeline(startDate, maxTimelineDate, freq);
  const deadlineLabel = getBucketLabel(deadlineDate.toISOString(), freq);
  const totalBuckets = allLabels.length;

  let internalCumulative = 0;
  let finalCumulative = 0;

  return allLabels.map((label, index) => {
    const bucket = bucketMap.get(label);
    if (bucket?.hasInternal) {
      internalCumulative += bucket.internal;
    }
    if (bucket?.hasFinal) {
      finalCumulative += bucket.final;
    }

    return {
      label,
      current: isCurrentBucket(label, freq),
      isDeadline: label === deadlineLabel,
      expectedValue: history.targetValue * ((index + 1) / totalBuckets),
      // Crucial: Only assign a value if this bucket actually had a submission.
      // Do NOT project flat lines into future periods where no submissions exist!
      internalValue: bucket?.hasInternal ? internalCumulative : null,
      finalValue: bucket?.hasFinal ? finalCumulative : null,
    };
  });
};

const formatChartValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 1 });

const formatMetricValue = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });

// ─── Component ───────────────────────────────────────────────────────────────

const KpiProgressChart = ({ history, role }: { history: KpiPeriodHistoryResponse; role: UserRole }) => {
  const [viewFreq, setViewFreq] = useState<ChartViewFrequency>('MONTHLY');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = buildChartPointsByFrequency(history, viewFreq);
  const visibleSeries = getChartSeriesKeys(role);
  const activeOption = VIEW_OPTIONS.find((o) => o.value === viewFreq) ?? VIEW_OPTIONS[0];

  // Dynamic layout calculations
  const isAngled = points.length > 6;
  const minPointSpacing = points.length > 24 ? 54 : points.length > 12 ? 64 : points.length > 6 ? 72 : 88;
  const dynamicPlotWidth = Math.max(620, (points.length - 1) * minPointSpacing);

  const padding = {
    top: 38,
    right: 36,
    bottom: isAngled ? 92 : 68,
    left: 88, // Space for rotated Y-axis legend and tick labels
  };

  const chartWidth = padding.left + dynamicPlotWidth + padding.right;
  const chartHeight = isAngled ? 330 : 285;
  const plotWidth = dynamicPlotWidth;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const colWidth = points.length <= 1 ? plotWidth : plotWidth / (points.length - 1);

  const hasSubmission = (p: ChartPoint) =>
    p.finalValue !== null || (visibleSeries.includes('INTERNAL') && p.internalValue !== null);

  const hoveredPoint =
    hoveredIndex !== null && hoveredIndex < points.length && hasSubmission(points[hoveredIndex])
      ? points[hoveredIndex]
      : null;

  let tooltipLeft = 0;
  let tooltipTop = 0;

  if (hoveredPoint !== null && hoveredIndex !== null) {
    const x = padding.left + (points.length <= 1 ? plotWidth / 2 : (hoveredIndex / (points.length - 1)) * plotWidth);
    const focusVal = hoveredPoint.finalValue ?? hoveredPoint.internalValue ?? 0;
    const maxVal = Math.max(history.targetValue, ...points.flatMap((p) => [p.internalValue ?? 0, p.finalValue ?? 0]), 1);
    const yMaxVal = maxVal * 1.12;
    const focusY = padding.top + plotHeight - (focusVal / yMaxVal) * plotHeight;

    // Center horizontally on point and clamp within chart width (compact 190px width)
    tooltipLeft = Math.max(12, Math.min(chartWidth - 210, x - 95));

    // Position above point if space permits, otherwise below (compact ~70px height)
    if (focusY > 90) {
      tooltipTop = focusY - 82;
    } else {
      tooltipTop = focusY + 16;
    }
  }

  const maxActualValue = Math.max(
    0,
    ...points.flatMap((p) => [p.internalValue ?? 0, p.finalValue ?? 0])
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
        return `${index === values.findIndex((v) => v !== null) ? 'M' : 'L'} ${getX(index)} ${getY(value)}`;
      })
      .filter(Boolean)
      .join(' ');

  const seriesPaths = visibleSeries.map((series) => ({
    series,
    path: buildPath(points.map((p) => (series === 'INTERNAL' ? p.internalValue : p.finalValue))),
  }));

  if (points.length === 0) return null;

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
      {/* ── Header ── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          p: 2.5,
          pb: 1.5,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>
            Cumulative progress by period
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25 }}>
            Tracks cumulative progress submissions over time toward the target goal.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap', gap: 1.5 }}
        >
          {/* ── View by dropdown ── */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
              View by:
            </Typography>
            <FormControl size="small">
              <Select
                value={viewFreq}
                onChange={(e) => {
                  setViewFreq(e.target.value as ChartViewFrequency);
                  setHoveredIndex(null);
                }}
                sx={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  minWidth: 140,
                }}
              >
                {VIEW_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* ── Series legend chips ── */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {visibleSeries.map((series) => (
              <Chip
                key={series}
                icon={
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: chartSeriesConfig[series].color,
                      display: 'inline-block',
                      ml: 1,
                    }}
                  />
                }
                label={chartSeriesConfig[series].label}
                size="small"
                sx={{
                  bgcolor: series === 'INTERNAL' ? '#EFF6FF' : '#ECFDF5',
                  color: chartSeriesConfig[series].color,
                  fontWeight: 600,
                }}
              />
            ))}
            <Chip
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 12,
                    borderTop: '2px dashed #2563EB',
                    display: 'inline-block',
                    ml: 1,
                  }}
                />
              }
              label="Current"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}
            />
            <Chip
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 12,
                    borderTop: '2px dashed #DC2626',
                    display: 'inline-block',
                    ml: 1,
                  }}
                />
              }
              label="Deadline"
              size="small"
              sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 600 }}
            />
          </Stack>
        </Stack>
      </Stack>

      {/* ── Axis Guide Helper Strip ── */}
      <Box
        sx={{
          px: 2.5,
          py: 0.75,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          <Box component="span" sx={{ color: '#334155' }}>Y-Axis (Vertical):</Box> Cumulative Value in{' '}
          <Box component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
            {history.unit || 'units'}
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          <Box component="span" sx={{ color: '#334155' }}>X-Axis (Horizontal):</Box>{' '}
          <Box component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
            {activeOption.axisLegend}
          </Box>{' '}
          (Start to Deadline)
        </Typography>
      </Box>

      {/* ── SVG Chart & Interactive Tooltip Container ── */}
      <Box sx={{ width: '100%', overflowX: 'auto', px: 1, pb: 1 }}>
        <Box sx={{ position: 'relative', width: chartWidth, minWidth: chartWidth, mx: 'auto' }}>
          <Box
            component="svg"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="KPI cumulative progress chart"
            onMouseLeave={() => setHoveredIndex(null)}
            sx={{ display: 'block', width: '100%', minWidth: chartWidth, height: 'auto' }}
          >
            <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="18" fill="#FFFFFF" />

            {/* ── Y-Axis Title (Rotated legend on left) ── */}
            <text
              x={24}
              y={padding.top + plotHeight / 2}
              transform={`rotate(-90 24 ${padding.top + plotHeight / 2})`}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#475569"
              letterSpacing="0.4"
            >
              {`Cumulative Progress (${history.unit || 'units'})`}
            </text>

            {/* ── Y-Axis Top Indicator ── */}
            <text
              x={padding.left - 8}
              y={padding.top - 12}
              textAnchor="end"
              fontSize="10"
              fontWeight="600"
              fill="#94A3B8"
            >
              {`↑ ${history.unit || 'units'}`}
            </text>

            {/* ── Y-axis grid + tick numbers ── */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#E5E7EB" />
                  <text x={padding.left - 12} y={y + 4} textAnchor="end" fontSize="12" fill="#64748B" fontWeight="500">
                    {formatChartValue(tick)}
                  </text>
                </g>
              );
            })}

            {/* ── Axes border lines ── */}
            <line
              x1={padding.left}
              x2={chartWidth - padding.right}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              x2={padding.left}
              y1={padding.top}
              y2={padding.top + plotHeight}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* ── Hover vertical guide line (only on periods with submissions) ── */}
            {hoveredIndex !== null && points[hoveredIndex] && hasSubmission(points[hoveredIndex]) && (
              <line
                x1={getX(hoveredIndex)}
                x2={getX(hoveredIndex)}
                y1={padding.top}
                y2={padding.top + plotHeight}
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
                pointerEvents="none"
              />
            )}

            {/* ── Actual series line (connects ONLY between actual submission periods) ── */}
            {seriesPaths.map(
              ({ series, path }) =>
                path && (
                  <path
                    key={series}
                    d={path}
                    fill="none"
                    stroke={chartSeriesConfig[series].color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
            )}

            {/* ── Data points + X labels ── */}
            {points.map((point, index) => {
              const x = getX(index);
              const pointHasSubmission = hasSubmission(point);
              const isPointHovered = hoveredIndex === index && pointHasSubmission;

              return (
                <g key={point.label}>
                  {/* Current and Deadline indicator lines & pill badges */}
                  {point.current && point.isDeadline ? (
                    <g pointerEvents="none">
                      <line
                        x1={x}
                        x2={x}
                        y1={padding.top}
                        y2={padding.top + plotHeight}
                        stroke="#DC2626"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                      {/* Current badge */}
                      <rect
                        x={x - 52}
                        y={padding.top - 20}
                        width="48"
                        height="16"
                        rx="8"
                        fill="#EFF6FF"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text x={x - 28} y={padding.top - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1D4ED8">
                        CURRENT
                      </text>
                      {/* Deadline badge */}
                      <rect
                        x={x + 4}
                        y={padding.top - 20}
                        width="54"
                        height="16"
                        rx="8"
                        fill="#FEF2F2"
                        stroke="#EF4444"
                        strokeWidth="1"
                      />
                      <text x={x + 31} y={padding.top - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#DC2626">
                        DEADLINE
                      </text>
                    </g>
                  ) : point.current ? (
                    <g pointerEvents="none">
                      <line
                        x1={x}
                        x2={x}
                        y1={padding.top}
                        y2={padding.top + plotHeight}
                        stroke="#2563EB"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                        opacity="0.65"
                      />
                      <rect
                        x={x - 24}
                        y={padding.top - 20}
                        width="48"
                        height="16"
                        rx="8"
                        fill="#EFF6FF"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={padding.top - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#1D4ED8"
                      >
                        CURRENT
                      </text>
                    </g>
                  ) : point.isDeadline ? (
                    <g pointerEvents="none">
                      <line
                        x1={x}
                        x2={x}
                        y1={padding.top}
                        y2={padding.top + plotHeight}
                        stroke="#DC2626"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                        opacity="0.75"
                      />
                      <rect
                        x={x - 27}
                        y={padding.top - 20}
                        width="54"
                        height="16"
                        rx="8"
                        fill="#FEF2F2"
                        stroke="#EF4444"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={padding.top - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#DC2626"
                      >
                        DEADLINE
                      </text>
                    </g>
                  ) : null}

                  {/* Actual submission circles: ONLY renders if submission exists on this period */}
                  {visibleSeries.map((series) => {
                    const value = series === 'INTERNAL' ? point.internalValue : point.finalValue;
                    if (value === null) return null;
                    return (
                      <g
                        key={series}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredIndex(index)}
                      >
                        {isPointHovered && (
                          <circle
                            cx={x}
                            cy={getY(value)}
                            r="10"
                            fill={chartSeriesConfig[series].color}
                            opacity="0.25"
                            pointerEvents="none"
                          />
                        )}
                        <circle
                          cx={x}
                          cy={getY(value)}
                          r={isPointHovered ? 6.5 : 5.5}
                          fill="#FFFFFF"
                          stroke={chartSeriesConfig[series].color}
                          strokeWidth={isPointHovered ? 3.5 : 3}
                          style={{ transition: 'all 0.15s ease' }}
                        />
                      </g>
                    );
                  })}

                  {/* X-axis tick label: angled if many labels to ensure high readability */}
                  <text
                    x={x}
                    y={padding.top + plotHeight + (isAngled ? 16 : 22)}
                    textAnchor={isAngled ? 'end' : 'middle'}
                    fontSize={isAngled ? '11' : '12'}
                    fontWeight={isPointHovered || point.current || point.isDeadline ? 700 : 500}
                    fill={
                      isPointHovered
                        ? '#0F172A'
                        : point.isDeadline
                          ? '#DC2626'
                          : point.current
                            ? '#1D4ED8'
                            : '#475569'
                    }
                    transform={isAngled ? `rotate(-35 ${x} ${padding.top + plotHeight + 16})` : undefined}
                    pointerEvents="none"
                  >
                    {point.label}
                  </text>

                  {/* Invisible full-height hover column trigger: ONLY for periods with submissions */}
                  {pointHasSubmission && (
                    <rect
                      x={x - colWidth / 2}
                      y={padding.top}
                      width={colWidth}
                      height={plotHeight + (isAngled ? 45 : 28)}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredIndex(index)}
                    />
                  )}
                </g>
              );
            })}

            {/* ── X-Axis Title / Legend at bottom center ── */}
            <text
              x={padding.left + plotWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#475569"
              letterSpacing="0.4"
            >
              {`Timeline / Reporting Period (${activeOption.axisLegend})`}
            </text>
          </Box>

          {/* ── Compact Custom Floating Tooltip Popover ── */}
          {hoveredPoint !== null && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                left: tooltipLeft,
                top: tooltipTop,
                pointerEvents: 'none',
                zIndex: 30,
                minWidth: 175,
                maxWidth: 215,
                borderRadius: 2,
                px: 1.5,
                py: 1.25,
                bgcolor: '#0F172A',
                color: '#F8FAFC',
                boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.4), 0 6px 12px -4px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'left 0.08s ease-out, top 0.08s ease-out',
              }}
            >
              {/* Header: Period label & optional Current / Deadline badges */}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.8rem', lineHeight: 1.2 }}>
                  {hoveredPoint.label}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {hoveredPoint.current && (
                    <Chip
                      label="Current"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        borderRadius: 0.75,
                        px: 0.5,
                      }}
                    />
                  )}
                  {hoveredPoint.isDeadline && (
                    <Chip
                      label="Deadline"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: '#DC2626',
                        color: '#FFFFFF',
                        borderRadius: 0.75,
                        px: 0.5,
                      }}
                    />
                  )}
                </Stack>
              </Stack>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 0.75 }} />

              {/* Official Final Progress */}
              {hoveredPoint.finalValue !== null && (
                <Box sx={{ mb: visibleSeries.includes('INTERNAL') && hoveredPoint.internalValue !== null ? 0.75 : 0 }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.25 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.72rem' }}>
                      Final Progress
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', pl: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#34D399', fontSize: '0.88rem' }}>
                      {formatMetricValue(hoveredPoint.finalValue)} {history.unit}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A7F3D0', fontWeight: 600, fontSize: '0.72rem' }}>
                      {((hoveredPoint.finalValue / history.targetValue) * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Box>
              )}

              {/* Staff Internal Progress (if visible and present) */}
              {visibleSeries.includes('INTERNAL') && hoveredPoint.internalValue !== null && (
                <Box>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.25 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#3B82F6', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.72rem' }}>
                      Internal Progress
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', pl: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#60A5FA', fontSize: '0.88rem' }}>
                      {formatMetricValue(hoveredPoint.internalValue)} {history.unit}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#BFDBFE', fontWeight: 600, fontSize: '0.72rem' }}>
                      {((hoveredPoint.internalValue / history.targetValue) * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default KpiProgressChart;
