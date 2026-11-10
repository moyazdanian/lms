import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { ChartCard } from '../dashboard/ChartCard';
import { ChartTooltip } from '../dashboard/ChartTooltip';
import { AXIS_PROPS, CHART_COLORS } from '@/lib/chartTheme';
import { formatCurrency, formatDate } from '@/lib/format';

/**
 * Earnings over time. Data is passed in from the Earnings page, which already
 * fetches it for the summary cards — so the screen makes one request, not two.
 */
export function EarningsChart({ series, loading, error, onRetry, className }) {
  const points = series || [];

  return (
    <ChartCard
      title="Revenue Overview"
      description="Your earnings after the platform fee"
      loading={loading}
      error={error}
      onRetry={onRetry}
      isEmpty={points.length === 0}
      height={300}
      className={className}>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="date"
            {...AXIS_PROPS}
            tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric' })}
            minTickGap={24} />
          
          <YAxis
            {...AXIS_PROPS}
            width={64}
            tickFormatter={(value) => formatCurrency(value, 'USD', { compact: true })} />
          
          <Tooltip
            content={<ChartTooltip formatValue={(value) => formatCurrency(value)} />} />
          
          <Area
            type="monotone"
            dataKey="amount"
            name="Earnings"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#earningsFill)"
            activeDot={{ r: 4 }} />
          
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>);

}