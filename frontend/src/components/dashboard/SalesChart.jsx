import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_PROPS, CHART_COLORS } from "@/lib/chartTheme";
import { formatDate, formatNumber } from "@/lib/format";
import { useInstructorSalesChart } from "@/hooks/instructor/useInstructorMarketplace";

export function SalesChart({ range, className, height = 240 }) {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getSalesAnalytics(range, { signal }),
  //   [range.from, range.to],
  // );

  const {data, isPending, isFetching, error, refetch } = useInstructorSalesChart(range);

  const loading = isPending || isFetching;

  const points = data || [];
  const total = points.reduce(
    (sum, point) => sum + Number(point.count || 0),
    0,
  );

  return (
    <ChartCard
      title="Sales Overview"
      description={
        loading || error
          ? "Sales over the selected period"
          : `${formatNumber(total)} sales`
      }
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={points.length === 0}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
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

          <YAxis {...AXIS_PROPS} width={40} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.08)" }}
            content={
              <ChartTooltip formatValue={(value) => formatNumber(value)} />
            }
          />

          <Bar
            dataKey="count"
            name="Sales"
            fill={CHART_COLORS.info}
            radius={[4, 4, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
