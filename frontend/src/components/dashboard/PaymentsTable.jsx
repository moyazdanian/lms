"use client";

import { CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayment } from "@/hooks/payment/usePayment";
import PaginationComponent from "../PaginationComponent";
import { useState } from "react";

export default function PaymentsTable() {
  const [page, setPage] = useState(1);
  const { userPaymentsQuery } = usePayment(page);

  const payments = userPaymentsQuery?.data?.data?.data ?? [];

  if (userPaymentsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Payment History</h3>
      {payments.length > 0 ? (
        <>
          <Table>
            <TableCaption>A list of your recent payments.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.order?.order_number}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : payment.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">
                    {payment.gateway}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.created_at).toDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(payment.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: payment.meta?.currency?.toUpperCase() || "USD",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationComponent
            className="mt-4"
            currentPage={userPaymentsQuery.data.meta.current_page}
            totalPages={userPaymentsQuery.data.meta.last_page}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No payment history found.
          </p>
        </div>
      )}
    </div>
  );
}
