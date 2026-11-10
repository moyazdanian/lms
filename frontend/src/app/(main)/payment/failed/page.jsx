"use client";
import Link from "next/link";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import request from "@/utilities/AxiosUtils";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();

  // Stripe returns session_id; PayPal/Mollie return payment_id; a dismissed
  // Razorpay modal carries razorpay_order_id. Whichever identifier is present
  // resolves the payment server-side. With no identifier at all we simply
  // show the failure screen — there is nothing to reconcile.
  const cancelParams = {
    session_id: searchParams.get("session_id") || undefined,
    payment_id: searchParams.get("payment_id") || undefined,
    razorpay_order_id: searchParams.get("razorpay_order_id") || undefined,
  };
  const hasIdentifier = Object.values(cancelParams).some(Boolean);

  const [status, setStatus] = useState(hasIdentifier ? "processing" : "error");

  useEffect(() => {
    if (!hasIdentifier) {
      return;
    }

    const cancelPayment = async () => {
      try {
        const response = await request({
          url: "/api/v1/payments/cancel",
          method: "POST",
          params: cancelParams,
        });


        setStatus(response?.status || "error");
      } catch (error) {
        console.error("Cancel payment error:", error);
        setStatus("error");
      }
    };

    cancelPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIdentifier]);

  if (status === "processing") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Checking payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (status === "canceled") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="text-2xl font-bold">Payment canceled</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment was not completed and you have not been charged. Your
              cart is untouched, so you can try again whenever you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
              <Button asChild className="flex-1">
                <Link href="/checkout">Back to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "paid") {
    return redirect("/payment/success");
  }

  // error / failed / pending — the payment could not be confirmed as paid.
  // It stays pending server-side (we never cancel blindly without asking the
  // gateway), so it can still complete later via the gateway webhook.
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500" />
          <h1 className="text-2xl font-bold">Payment not completed</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {status === "pending"
              ? "Your payment is still being processed. If you were charged, it will be confirmed automatically in a few minutes."
              : "Something went wrong and we could not confirm your payment. You have not been charged for a new payment — please try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Button asChild className="flex-1">
              <Link href="/checkout">Back to Checkout</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
