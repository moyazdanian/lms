"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, Tag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ShowPrice from "@/components/ui/ShowPrice";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/cart/useCart";
import { useCoupon } from "@/hooks/coupon/useCoupon";
import { useRemoveCoupon } from "@/hooks/coupon/useRemoveCoupon";
import { useApplyCoupon } from "@/hooks/coupon/useApplyCoupon";
import { usePayment, usePaymentMethods } from "@/hooks/payment/usePayment";
import { SiPaypal, SiRazorpay, SiStripe } from "@icons-pack/react-simple-icons";

export default function CheckoutPage() {
  const [discountInput, setDiscountInput] = useState("");

  const { data: cart, isPending } = useCart();

  const { data: coupon, isPending: isGettingCoupon } = useCoupon();

  const { paymentQuery } = usePayment();
  const { data: paymentMethods } = usePaymentMethods();

  const { mutate: removeCoupon, isPending: isRemoving } = useRemoveCoupon();

  const { mutate: applyCoupon, isPending: isApplying } = useApplyCoupon();

  // The cart subtotal already reflects per-course sale prices; the applied
  // coupon (if any) comes from the server session and carries its own
  // discount/final_amount values.
  const subtotal = Number(cart?.subtotal || 0);
  const couponDiscount = Number(coupon?.discount || 0);
  const couponFinal = Number(coupon?.final_amount || 0);
  const isCouponValid = Boolean(coupon && couponDiscount > 0);

  const calculateTotal = () => {
    const discount = isCouponValid ? couponDiscount : 0;
    return Math.max(0, subtotal - discount);
  };

  // A zero total (all-free cart or a 100% coupon) skips the gateways:
  // choosing any method completes the free enrollment server-side.
  const isFreeCheckout = subtotal <= 0 || calculateTotal() === 0;

  const handleApplyCoupon = () => {
    if (!discountInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    applyCoupon(discountInput);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  if (isPending || isGettingCoupon) {
    return (
      <div className="w-full p-6 min-h-[80vh] mt-15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          {/* Order summary skeleton */}
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>

          {/* Payment skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-[80vh]">
      {/* Razorpay Checkout JS — fetched lazily, used only by the Razorpay modal flow */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      {cart?.cart.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before checking out
            </p>
            <Button asChild>
              <a href="/courses">Browse Courses</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Order Summary</span>
                  <Badge variant="outline" className="ml-2">
                    {cart?.cart.length}{" "}
                    {cart?.cart.length === 1 ? "item" : "items"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart?.cart.map((item) => (
                    <Link href={`/courses/${item.course.slug}`} key={item.id}>
                      <div className=" flex gap-2 items-center mb-2 justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-stone-950 transition-colors">
                        <div className="relative h-18">
                          <Image
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.course.title}</h4>
                          <p className="text-sm text-gray-500">
                            By {item.course.instructor.name}
                          </p>
                        </div>
                        <div className="font-semibold">
                          <ShowPrice
                            price={item.price}
                            discount_price={item.discount_price}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Apply Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coupon && coupon?.discount > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            Coupon Applied:{" "}
                            <span className="font-bold">{coupon?.code}</span>
                          </p>
                          <p className="text-sm text-green-600">
                            You saved ${coupon?.discount}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRemoving}
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {isRemoving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter your coupon code"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplying || !discountInput.trim()}
                        className="whitespace-nowrap"
                      >
                        {isApplying ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter your coupon code and click Apply to get discount
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Payment Summary */}
          <div className="space-y-6">
            {/* Order Total Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${cart?.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {coupon && coupon?.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Coupon Discount:</span>
                      <span className="font-medium">-${coupon?.discount}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      $
                      {coupon && coupon?.discount > 0
                        ? coupon?.final_amount
                        : cart?.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 pt-2">
                    <p>
                      By completing your purchase you agree to our Terms of
                      Service
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods — or the free-enrollment button */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isFreeCheckout
                    ? "Complete Enrollment"
                    : "Select Payment Method"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isFreeCheckout ? (
                  <>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-14 text-base"
                      disabled={paymentQuery.isPending}
                      onClick={() => paymentQuery.mutate("free")}
                    >
                      {paymentQuery.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5 mr-2" />
                      )}
                      {paymentQuery.isPending
                        ? "Enrolling..."
                        : "Complete free enrollment"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Nothing to pay — enrollments are granted instantly.
                    </p>
                  </>
                ) : (paymentMethods ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No payment method is available right now. Please contact
                    support.
                  </p>
                ) : (
                  paymentMethods.map((method) => (
                    <PaymentMethodButton
                      key={method.key}
                      method={method}
                      disabled={paymentQuery.isPending}
                      isPending={
                        paymentQuery.isPending &&
                        paymentQuery.variables === method.key
                      }
                      onSelect={() => paymentQuery.mutate(method.key)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Security & Support Info */}
            <Card className="">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <div>
                      <p className="text-sm font-medium">Secure Payment</p>
                      <p className="text-xs text-gray-600">
                        Your payment information is encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">ⓘ</div>
                    <div>
                      <p className="text-sm font-medium">Need Help?</p>
                      <p className="text-xs text-gray-600">
                        Contact our support team
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

const METHOD_STYLES = {
  stripe: { letter: "S", color: "bg-black", icon: SiStripe },
  paypal: { letter: "P", color: "bg-blue-500", icon: SiPaypal },
  mollie: { letter: "M", color: "bg-purple-500" },
  razorpay: { letter: "R", color: "bg-indigo-600", icon: SiRazorpay },
};

function PaymentMethodButton({ method, disabled, isPending, onSelect }) {
  const style = METHOD_STYLES[method.key] ?? {
    letter: method.label.charAt(0),
    color: "bg-gray-500",
  };

  return (
    <Button
      className="w-full justify-start h-14 text-base"
      disabled={disabled}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 ${style.color} text-white rounded flex items-center justify-center font-bold`}
        >
          {style.icon ? <style.icon /> : style.letter}
        </div>
        <div className="text-left">
          <div className="font-semibold">
            {isPending ? "Redirecting..." : method.label}
          </div>
          <div className="text-xs text-gray-500">{method.description}</div>
        </div>
        {isPending && <Loader2 className="ml-auto w-5 h-5 animate-spin" />}
      </div>
    </Button>
  );
}
