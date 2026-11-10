import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { AXIS_PROPS, CHART_COLORS } from '@/lib/chartTheme';
import { formatDate, formatNumber } from '@/lib/format';
import { useInstructorEnrollmentChart } from '@/hooks/instructor/useInstructorMarketplace';

/** New enrollments per period as bars, with the cumulative trend as a line. */
export function EnrollmentChart({ range, className, height = 240 }) {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getEnrollmentAnalytics(range, { signal }),
  //   [range.from, range.to]
  // );

  const {data , isPending, isFetching, error, refetch} = useInstructorEnrollmentChart(range);

  const loading = isPending || isFetching;  

  const points = data || [];
  const newEnrollments = points.reduce(
    (sum, point) => sum + Number(point.new_enrollments || 0),
    0
  );

  return (
    <ChartCard
      title="Student Enrollment"
      description={
      loading || error ?
      'New enrollments and total trend' :
      `${formatNumber(newEnrollments)} new enrollments`
      }
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={points.length === 0}
      height={height}
      className={className}>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="date"
            {...AXIS_PROPS}
            tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric' })}
            minTickGap={24} />
          
          <YAxis {...AXIS_PROPS} width={40} allowDecimals={false} />
          <YAxis
            yAxisId="total"
            orientation="right"
            {...AXIS_PROPS}
            width={52}
            tickFormatter={(value) => formatNumber(value)} />
          
          <Tooltip content={<ChartTooltip formatValue={(value) => formatNumber(value)} />} />
          <Bar
            dataKey="new_enrollments"
            name="New enrollments"
            fill={CHART_COLORS.success}
            radius={[4, 4, 0, 0]}
            maxBarSize={32} />
          
          <Line
            yAxisId="total"
            type="monotone"
            dataKey="total_enrollments"
            name="Total enrolled"
            stroke={CHART_COLORS.axis}
            strokeWidth={2}
            dot={false} />
          
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>);

}