"use client";
import React, { Suspense, lazy, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ChartCardSkeleton } from "@/components/dashboard/ChartCard";
import { CoursePerformance } from "@/components/dashboard/CoursePerformance";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { resolveRange } from "@/lib/dateRanges";
import { useAuth } from "@/contexts/AuthContext";
import { useInstructorEarnings } from "@/hooks/instructor/useInstructorMarketplace";
import RoleGuard from "./RoleGuard";

// Charts pull in the charting library, so they load after the shell paints.
const RevenueChart = lazy(() =>
  import("@/components/dashboard/RevenueChart").then((module) => ({
    default: module.RevenueChart,
  })),
);
const SalesChart = lazy(() =>
  import("@/components/dashboard/SalesChart").then((module) => ({
    default: module.SalesChart,
  })),
);
const EnrollmentChart = lazy(() =>
  import("@/components/dashboard/EnrollmentChart").then((module) => ({
    default: module.EnrollmentChart,
  })),
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [selection, setSelection] = useState({ preset: "30d" });
  const range = useMemo(() => resolveRange(selection), [selection]);

  // const { data: stats, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getDashboardStats(range, { signal }),
  //   [range.from, range.to]
  // );

  const {
    data: stats,
    isPending,
    isFetching,
    error,
    refetch,
  } = useInstructorEarnings(selection);

  const loading = isPending || isFetching;

  return (
    <RoleGuard roles={["admin", "instructor"]}>
      <div className="space-y-6">
        <PageHeader
          title={`Welcome back, ${user.name.split(" ")[0]}`}
          description="Revenue, sales and enrollment performance across your courses."
          actions={
            <DateRangeFilter
              value={range}
              onChange={(next) =>
                setSelection((current) => ({ ...current, ...next }))
              }
            />
          }
        />

        <DashboardStats
          stats={stats}
          loading={loading}
          error={error}
          onRetry={refetch}
          comparisonLabel={range.comparison}
        />

        <Suspense fallback={<ChartCardSkeleton height={300} />}>
          <RevenueChart range={range} height={300} />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<ChartCardSkeleton height={240} />}>
            <SalesChart range={range} />
          </Suspense>
          <Suspense fallback={<ChartCardSkeleton height={240} />}>
            <EnrollmentChart range={range} />
          </Suspense>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <CoursePerformance range={range} className="xl:col-span-2" />
          <RecentSales className="xl:col-span-3" />
        </div>
      </div>
    </RoleGuard>
  );
}
