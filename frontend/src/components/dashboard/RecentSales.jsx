import React from "react";
import { ReceiptIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
import Link from "next/link";
import { useInstructorRecentSales } from "@/hooks/instructor/useInstructorMarketplace";

export function RecentSales({ limit = 6, className }) {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getRecentSales({ limit }, { signal }),
  //   [limit]
  // );

  const { data, isPending, isFetching, error, refetch } =
    useInstructorRecentSales(limit);

  const loading = isPending || isFetching;

  const sales = data || [];

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Recent Sales</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/payments/sales">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No sales yet"
            description="New enrollments will appear here as soon as they happen."
          />
        ) : (
          <>
            {/* Mobile: rows become cards */}
            <ul className="space-y-3 md:hidden">
              {sales.map((sale) => (
                <li
                  key={sale.id}
                  className="rounded-md border border-border p-3"
                >
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
                          {sale.course.title}
                        </p>
                      </div>
                    </div>
                    <StatusBadge domain="payment" status={sale.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-medium">
                        {formatCurrency(sale.gross_amount, sale.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Your earnings</dt>
                      <dd className="font-medium">
                        {formatCurrency(
                          sale.instructor_earnings,
                          sale.currency,
                        )}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="font-medium">
                        {formatDate(sale.created_at)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <TableScroll className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Your earnings</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {initials(sale.student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="whitespace-nowrap font-medium">
                            {sale.student.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <span className="block truncate">
                          {sale.course.title}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {formatCurrency(sale.gross_amount, sale.currency)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium">
                        {formatCurrency(
                          sale.instructor_earnings,
                          sale.currency,
                        )}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
