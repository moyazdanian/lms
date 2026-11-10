import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_PROPS, CHART_COLORS } from "@/lib/chartTheme";
import { formatCurrency, formatDate } from "@/lib/format";
import { useInstructorEarningChart } from "@/hooks/instructor/useInstructorMarketplace";

/** Revenue over time for the instructor dashboard. */
export function RevenueChart({ range, className, height = 300 }) {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getRevenueAnalytics(range, { signal }),
  //   [range.from, range.to],
  // );

  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useInstructorEarningChart(range);

  const loading = isPending || isFetching;

  const points = data || [];
  const total = points.reduce(
    (sum, point) => sum + Number(point.amount || 0),
    0,
  );

  return (
    <ChartCard
      title="Revenue Overview"
      description={
        loading || error
          ? "Revenue over the selected period"
          : `${formatCurrency(total)} across the selected period`
      }
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={points.length === 0}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 4 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            {...AXIS_PROPS}
            tickFormatter={(value) =>
              formatDate(value, { month: "short", day: "numeric" })
            }
            minTickGap={24}
          />

          <YAxis
            {...AXIS_PROPS}
            width={64}
            tickFormatter={(value) =>
              formatCurrency(value, "USD", { compact: true })
            }
          />

          <Tooltip
            content={
              <ChartTooltip formatValue={(value) => formatCurrency(value)} />
            }
          />

          <Area
            type="monotone"
            dataKey="amount"
            name="Revenue"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
