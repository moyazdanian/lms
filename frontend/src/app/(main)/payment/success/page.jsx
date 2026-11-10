"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyPaymentApi } from "@/lib/api/checkout";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL = 2000;

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Stripe returns session_id; PayPal/Mollie return payment_id; Razorpay's
  // modal flow posts razorpay_* fields. All resolve server-side.
  const verifyParams = {
    session_id: searchParams.get("session_id") || undefined,
    payment_id: searchParams.get("payment_id") || undefined,
    razorpay_order_id: searchParams.get("razorpay_order_id") || undefined,
    razorpay_payment_id: searchParams.get("razorpay_payment_id") || undefined,
    razorpay_signature: searchParams.get("razorpay_signature") || undefined,
  };
  const hasIdentifier = Object.values(verifyParams).some(Boolean);
  // Free checkouts (all-free cart or a 100% coupon) are completed
  // synchronously — nothing to verify with a gateway.
  const isFreeCheckout = searchParams.get("free") === "1";

  useEffect(() => {
    if (!hasIdentifier && !isFreeCheckout) {
      router.replace("/checkout");
    }
  }, [hasIdentifier, isFreeCheckout, router]);

  const verifyQuery = useQuery({
    queryKey: ["payment-verify", verifyParams],
    queryFn: () => verifyPaymentApi(verifyParams),
    enabled: hasIdentifier,
    retry: 2,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const attempts = query.state.dataUpdateCount;

      if (status === "pending" && attempts < MAX_POLL_ATTEMPTS) {
        return POLL_INTERVAL;
      }

      return false;
    },
  });

  const status = verifyQuery.data?.status;
  const isPaid = status === "paid";
  const stillPending =
    status === "pending" && verifyQuery.dataUpdateCount >= MAX_POLL_ATTEMPTS;

  useEffect(() => {
    if (isPaid) {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-courses"] });
    }
  }, [isPaid, queryClient]);

  if (isFreeCheckout) {
    return (
      <ResultCard
        icon={<CheckCircle2 className="w-16 h-16 text-green-500" />}
        title="You're enrolled!"
        description="Your free enrollment is confirmed. You can start learning right away."
        primaryHref="/dashboard/courses"
        primaryLabel="Go to My Courses"
        secondaryHref="/courses"
        secondaryLabel="Browse More Courses"
      />
    );
  }

  if (!hasIdentifier) return null;

  if (verifyQuery.isError) {
    return (
      <ResultCard
        icon={<Clock className="w-16 h-16 text-amber-500" />}
        title="We couldn't confirm your payment"
        description="If you completed the payment, your courses will show up in your dashboard shortly. Otherwise you can safely try again."
        primaryHref="/dashboard"
        primaryLabel="Go to Dashboard"
        secondaryHref="/checkout"
        secondaryLabel="Back to Checkout"
      />
    );
  }

  if (isPaid) {
    return (
      <ResultCard
        icon={<CheckCircle2 className="w-16 h-16 text-green-500" />}
        title="Payment successful!"
        description={
          verifyQuery.data?.order_number
            ? `Order ${verifyQuery.data.order_number} is confirmed. You're enrolled and can start learning right away.`
            : "Your order is confirmed. You're enrolled and can start learning right away."
        }
        primaryHref="/dashboard/courses"
        primaryLabel="Go to My Courses"
        secondaryHref="/courses"
        secondaryLabel="Browse More Courses"
      />
    );
  }

  if (stillPending) {
    return (
      <ResultCard
        icon={<Clock className="w-16 h-16 text-amber-500" />}
        title="Payment is being processed"
        description="Your payment is still being confirmed. Your courses will appear in your dashboard shortly."
        primaryHref="/dashboard"
        primaryLabel="Go to Dashboard"
        secondaryHref="/courses"
        secondaryLabel="Browse Courses"
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h1 className="text-xl font-semibold">Confirming your payment...</h1>
        <p className="text-sm text-gray-500">
          Please wait a moment, this usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}

function ResultCard({
  icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {icon}
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Button asChild className="flex-1">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
