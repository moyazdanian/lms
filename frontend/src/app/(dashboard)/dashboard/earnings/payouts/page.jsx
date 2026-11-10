"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PayoutRequestDialog } from "@/components/payments/PayoutRequestDialog";
import { PayoutHistory } from "@/components/payments/PayoutHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/Pagination";
import { formatCurrency } from "@/lib/format";
import { useInstructorPayoutRequests } from "@/hooks/instructor/useInstructorMarketplace";

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getPayoutRequests({ page, perPage: 8 }, { signal }),
  //   [page],
  // );

  const { data, isPending, isFetching, error, refetch } =
    useInstructorPayoutRequests(page);

  const loading = isPending || isFetching;


  const balance = data?.balance;
  const available = Number(balance?.available_balance || 0);
  const minimum = Number(balance?.minimum_payout_amount || 0);
  const canRequest = available >= minimum && available > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Requests"
        description="Withdraw your available balance and follow each request through review."
        actions={
          <PayoutRequestDialog
            balance={balance}
            disabled={loading || !canRequest}
            onSuccess={refetch}
          />
        }
      />

      <Card>
        <CardContent className="grid gap-6 p-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Available Balance
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-10 w-48" />
            ) : (
              <p className="mt-1 text-4xl font-semibold tracking-tight">
                {formatCurrency(available, balance?.currency)}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {loading
                ? "Loading your balance…"
                : canRequest
                  ? "Ready to withdraw now."
                  : `You need at least ${formatCurrency(minimum, balance?.currency)} to request a payout.`}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Minimum Payout Amount
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-6 w-24" />
              ) : (
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(minimum, balance?.currency)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Balance
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-6 w-24" />
              ) : (
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(balance?.pending_balance, balance?.currency)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PayoutHistory
        payouts={data?.data || []}
        loading={loading}
        error={error}
        onRetry={refetch}
      />

      <Pagination meta={data?.meta} onPageChange={setPage} />
    </div>
  );
}
