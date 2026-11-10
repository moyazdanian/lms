import React, { useState } from "react";
import { ReceiptIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
import { formatCurrency, formatDate, initials } from "@/lib/format";

export function SalesTable({ sales, loading, error, onRetry, isFiltered }) {
  const [expandedTitles, setExpandedTitles] = useState(new Set());

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

  if (!sales.length) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title={isFiltered ? "No sales match these filters" : "No sales yet"}
        description={
          isFiltered
            ? "Try a different search term, status or date range."
            : "When a student enrolls in one of your courses, the order appears here."
        }
      />
    );
  }

  return (
    <>
      {/* Mobile: each order becomes a card */}
      <ul className="space-y-3 lg:hidden">
        {sales.map((sale) => (
          <li key={sale.id}>
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {initials(sale.student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {sale.student.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {sale.order_id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge domain="payment" status={sale.status} />
                </div>
                <p className="truncate text-sm">{sale.course.title}</p>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Catalog price</dt>
                    <dd className="font-medium">
                      {formatCurrency(sale.catalog_price, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Gross</dt>
                    <dd className="font-medium">
                      {formatCurrency(sale.gross_amount, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Coupon discount</dt>
                    <dd className="font-medium text-destructive">
                      -{formatCurrency(sale.coupon_discount, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Final amount</dt>
                    <dd className="font-medium">
                      {formatCurrency(sale.final_amount, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Platform fee</dt>
                    <dd className="font-medium text-destructive">
                      −{formatCurrency(sale.platform_fee, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Your earnings</dt>
                    <dd className="font-medium">
                      {formatCurrency(sale.instructor_earnings, sale.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">
                      {formatDate(sale.created_at)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="hidden lg:block">
        <TableScroll>
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Catalog price</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Coupon discount</TableHead>
                <TableHead>Final amount</TableHead>
                <TableHead>Platform fee</TableHead>
                <TableHead>Your earnings</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {initials(sale.student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block whitespace-nowrap font-medium">
                          {sale.student.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {sale.student.email}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <button
                      type="button"
                      className="block max-w-full text-left"
                      onClick={() =>
                        setExpandedTitles((current) => {
                          const next = new Set(current);
                          if (next.has(sale.id)) next.delete(sale.id);
                          else next.add(sale.id);
                          return next;
                        })
                      }
                      title={sale.course.title}
                    >
                      <span className="block truncate">
                        {expandedTitles.has(sale.id) ||
                        sale.course.title.length <= 10
                          ? sale.course.title
                          : `${sale.course.title.slice(0, 10)}...`}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {sale.order_id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(sale.catalog_price, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(sale.gross_amount, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-destructive">
                    -{formatCurrency(sale.coupon_discount, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(sale.final_amount, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-destructive">
                    −{formatCurrency(sale.platform_fee, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(sale.instructor_earnings, sale.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(sale.created_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge domain="payment" status={sale.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}
