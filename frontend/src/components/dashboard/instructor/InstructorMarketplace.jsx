"use client";

import { useState } from "react";
import { Banknote, Loader2, ShoppingBag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useInstructorEarnings,
  useInstructorPayoutRequests,
  useCreateInstructorPayoutRequest,
} from "@/hooks/instructor/useInstructorMarketplace";
import { PayoutHistory } from "./PayoutHistory";

const money = (value, currency = "USD") =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

export default function InstructorMarketplace() {
  const [amount, setAmount] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [page, setPage] = useState(1);
  const earningsQuery = useInstructorEarnings(page);
  const requestsQuery = useInstructorPayoutRequests();
  const payoutMutation = useCreateInstructorPayoutRequest();
  const summary = earningsQuery.data?.summary || {};
  const earnings = earningsQuery.data?.data || [];
  const requests =
    requestsQuery.data?.data?.data || requestsQuery.data?.data || [];

  const submit = (event) => {
    event.preventDefault();
    payoutMutation.mutate(
      { amount, payment_details: paymentDetails },
      {
        onSuccess: () => {
          setAmount("");
          setPaymentDetails("");
        },
      },
    );
  };

  if (earningsQuery.isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Instructor earnings</h2>
        <p className="text-sm text-muted-foreground">
          Track your sales, commission and payout requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Available", summary.available, Wallet],
          ["Under review", summary.requested, Banknote],
          ["Paid", summary.paid, ShoppingBag],
        ].map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{money(value)}</p>
                </div>
                <Icon className="h-7 w-7 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request a payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment details</label>
              <Textarea
                placeholder="Bank account, PayPal email, or other payment instructions"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                maxLength={2000}
                required
              />
            </div>
            {payoutMutation.isError && (
              <p className="text-sm text-red-600">
                {payoutMutation.error?.response?.data?.message ||
                  "Unable to submit payout request."}
              </p>
            )}
            {payoutMutation.isSuccess && (
              <p className="text-sm text-green-600">
                Your payout request was submitted.
              </p>
            )}
            <Button type="submit" disabled={payoutMutation.isPending}>
              {payoutMutation.isPending ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Payout request history</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payout requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {money(item.amount, item.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    {item.payment_details && (
                      <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                        <p className="font-medium">Payment details</p>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {item.payment_details}
                        </p>
                      </div>
                    )}
                    {item.rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {item.rejection_reason}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}

      <PayoutHistory requests={requests} />

      <Card>
        <CardHeader>
          <CardTitle>Sales and earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sales recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Sale</th>
                    <th className="py-2">Gross</th>
                    <th className="py-2">Commission</th>
                    <th className="py-2">Net</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">#{item.order_id}</td>
                      <td>{money(item.gross_amount)}</td>
                      <td>{money(item.commission_amount)}</td>
                      <td>{money(item.net_amount)}</td>
                      <td className="capitalize">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {earningsQuery.data?.meta?.last_page > 1 && (
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm self-center">
                Page {page} of {earningsQuery.data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= earningsQuery.data.meta.last_page}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
