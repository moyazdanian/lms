import React, { useState } from "react";
import { ReceiptIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export function PurchaseHistoryTable({
  purchases,
  loading,
  error,
  onRetry,
  isFiltered,
}) {
  const [selected, setSelected] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;

  if (!purchases.length) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title={
          isFiltered
            ? "No purchases match these filters"
            : "You haven't purchased any courses yet."
        }
        description={
          isFiltered
            ? "Try a different search term, status or date range."
            : "Your orders and invoices will appear here after your first purchase."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile: each order becomes a card */}
      <ul className="space-y-3 md:hidden">
        {purchases.map((purchase) => (
          <li key={purchase.id}>
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">
                      {purchase?.order?.order_number}
                    </p>
                  </div>
                  <StatusBadge domain="payment" status={purchase.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold">
                    {formatCurrency(purchase.amount, purchase.currency)}
                  </span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(purchase.coupon_amount, purchase.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(purchase.created_at)}
                  </span>
                  <span className="text-muted-foreground">
                    {purchase.gateway}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelected(purchase)}
                >
                  View details
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="hidden md:block">
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Order ID</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Coupon Amount</TableHead>
                <TableHead className="text-center">Gateway</TableHead>
                <TableHead className="text-center">Payment status</TableHead>
                <TableHead className="text-center">Purchase date</TableHead>
                <TableHead className="text-center">
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="whitespace-nowrap text-center font-mono text-xs">
                    {purchase.order?.order_number}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center font-medium">
                    {formatCurrency(purchase.amount, purchase.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center font-medium">
                    {formatCurrency(purchase.coupon_amount, purchase.currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    {purchase.gateway}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge domain="payment" status={purchase.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center text-muted-foreground">
                    {formatDate(purchase.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(purchase)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </Card>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase details</DialogTitle>
            <DialogDescription className="font-mono">
              {selected?.order?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <Separator />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd>{formatCurrency(selected.amount, selected.currency)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Coupon</dt>
                  <dd>
                    {formatCurrency(selected.coupon_amount, selected.currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Payment gateway</dt>
                  <dd>{selected.gateway}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Purchased</dt>
                  <dd>{formatDateTime(selected.created_at)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
