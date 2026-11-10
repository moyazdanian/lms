"use client";
import React, { Suspense, lazy, useMemo, useState } from "react";
import { WalletIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ChartCardSkeleton } from "@/components/dashboard/ChartCard";
import { EarningsCards } from "@/components/payments/EarningsCards";
import { EarningsBreakdown } from "@/components/payments/EarningsBreakdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resolveRange } from "@/lib/dateRanges";
import { useInstructorEarningChart, useInstructorEarnings } from "@/hooks/instructor/useInstructorMarketplace";

const EarningsChart = lazy(() =>
  import("@/components/payments/EarningsChart").then((module) => ({
    default: module.EarningsChart,
  })),
);

export default function EarningsPage() {
  const [selection, setSelection] = useState({ preset: "30d" });
  const range = useMemo(() => resolveRange(selection), [selection]);

  const { data, isPending, isFetching, error, refetch } =
    useInstructorEarnings(selection);


  const {
      data: chartData,
      isPending: chartIsPending,
      isFetching: chartIsFetching,
      error: chartError,
      refetch: chartRefetch,
    } = useInstructorEarningChart(range);
                                                                                                                                                                           
  const loading = isPending || isFetching;

  const chartLoading = chartIsPending || chartIsFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        description="Track what you have earned, what is still clearing and what is ready to withdraw."
        actions={
          <>
            <DateRangeFilter
              value={range}
              onChange={(next) =>
                setSelection((current) => ({ ...current, ...next }))
              }
            />

            <Button asChild>
              <Link href="/dashboard/earnings/payouts">
                <WalletIcon aria-hidden="true" />
                Request payout
              </Link>
            </Button>
          </>
        }
      />

      <EarningsCards
        earnings={data}
        loading={loading}
        error={error}
        onRetry={refetch}
      />

      <div className="">
        <Suspense
          fallback={
            <ChartCardSkeleton height={300}  />
          }
        >
          <EarningsChart
            series={chartData}
            loading={chartLoading}
            error={chartError}
            onRetry={chartRefetch}
          />
        </Suspense>
        {/* <EarningsBreakdown
          breakdown={data?.breakdown}
          currency={data?.currency}
          loading={loading}
        /> */}
      </div>
    </div>
  );
}
