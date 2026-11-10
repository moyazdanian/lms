import React from "react";
import { WalletIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "../ui/table";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function PayoutHistory({ payouts, loading, error, onRetry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout history</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={onRetry} />
        ) : !payouts.length ? (
          <EmptyState
            icon={WalletIcon}
            title="No payout requests yet"
            description="Once you request a payout it will appear here with its status."
          />
        ) : (
          <>
            {/* Mobile: each request becomes a card */}
            <ul className="space-y-3 lg:hidden">
              {payouts.map((payout) => (
                <li
                  key={payout.id}
                  className="rounded-md border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {payout.id}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                    <StatusBadge domain="payout" status={payout.status} />
                  </div>
                  <dl className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Requested</dt>
                      <dd>{formatDateTime(payout.created_at)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Processed</dt>
                      <dd>{formatDateTime(payout.processed_at)}</dd>
                    </div>
                  </dl>
                  {payout.admin_note ? (
                    <p
                      className={
                        payout.status === "rejected"
                          ? "mt-3 rounded-md border border-destructive/25 bg-destructive/5 p-2 text-xs text-foreground"
                          : "mt-3 text-xs text-muted-foreground"
                      }
                    >
                      {payout.status === "rejected" ? (
                        <span className="block font-semibold text-destructive">
                          Rejection reason
                        </span>
                      ) : null}
                      {payout.admin_note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            <TableScroll className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested at</TableHead>
                    <TableHead>Processed at</TableHead>
                    <TableHead>Admin note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {payout.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium">
                        {formatCurrency(payout.amount, payout.currency)}
                      </TableCell>
                      <TableCell>{payout.currency}</TableCell>
                      <TableCell>
                        <StatusBadge domain="payout" status={payout.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(payout.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(payout.processed_at)}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        {payout.admin_note ? (
                          payout.status === "rejected" ? (
                            <span className="block rounded-md border border-destructive/25 bg-destructive/5 p-2 text-xs">
                              <span className="block font-semibold text-destructive">
                                Rejection reason
                              </span>
                              {payout.admin_note}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {payout.admin_note}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          </>
        )}
      </CardContent>
    </Card>
  );
}
