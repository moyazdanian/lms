"use client";
import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2, Trash2, X } from "lucide-react";
import { avatarSrc } from "@/lib/avatar";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShowPrice from "@/components/ui/ShowPrice";
import { useCart } from "@/hooks/cart/useCart";
import { useUser } from "@/hooks/useUser";
import { useGuestCart } from "@/hooks/cart/useGuestCart";
import { useCoupon } from "@/hooks/coupon/useCoupon";
import { useApplyCoupon } from "@/hooks/coupon/useApplyCoupon";
import { useRemoveCoupon } from "@/hooks/coupon/useRemoveCoupon";
import { useRemoveFromCart } from "@/hooks/cart/useRemoveFromCart";

export default function CartPage() {
  const { data, isPending } = useCart();
  const { mutate: removFromUserCart, isPending: isRemovingFromCart } =
    useRemoveFromCart();
  const { mutate: applyCoupon, isPending: isApplying } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemoving } = useRemoveCoupon();
  const { guestCartQuery: guestCart, removeFromGuestCart } = useGuestCart();
  const { data: user } = useUser();
  const cart = !user ? guestCart.data : data;
  const hasDiscount = cart?.grandtotal - cart?.subtotal > 0;

  const { data: coupon, isPending: isGettingCoupon } = useCoupon();

  const [discountInput, setDiscountInput] = useState("");

  const handleApplyCoupon = () => {
    if (!discountInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const result = applyCoupon(discountInput);
    if (result) {
      setDiscountInput(result.code);
    }
  };

  const handleRemoveFromCart = (id) => {
    if (coupon && coupon.discount > 0) {
      removeCoupon(undefined, {
        onSuccess: () => {
          toast.info("Coupon was removed because your cart was updated!");
        },
      });
    }
    if (user) {
      removFromUserCart(id);
    } else {
      removeFromGuestCart.mutate(id);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setDiscountInput("");
  };

  const calculateTotal = () => {
    const discount = coupon?.discount;
    return Math.max(0, cart.subtotal - discount);
  };

  if (isPending || isGettingCoupon) {
    return (
      <div className="min-h-[60vh]">
        <div className="flex items-center space-x-4 p-3 mx-10 mt-10 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      {/* Cart items */}
      <div className="space-y-4">
        {cart?.cart.length > 0 ? (
          <>
            <div className="hidden sm:block space-y-4">
              {cart?.cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <div>
                        <Link href={`/courses/${item.course.slug}`}>
                          <h2 className="font-semibold">{item.course.title}</h2>
                        </Link>
                        <p className="text-sm text-gray-500">${item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-light">By:</span>
                      <Avatar>
                        <AvatarImage
                          src={avatarSrc(item.course.instructor.avatar)}
                        />
                        <AvatarFallback>
                          {item.course.instructor.name}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {item.course.instructor.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <ShowPrice
                        price={item.price}
                        discount_price={item?.discount_price}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the item from your cart
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemoveFromCart(item.course.id)
                              }
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Accordion
              type="single"
              collapsible
              className="block space-y-3  sm:hidden"
            >
              {cart?.cart.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={String(item.id)}
                  className="border rounded-lg overflow-hidden bg-neutral-900 "
                >
                  <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                    <div className="flex w-full items-center gap-3 pr-2">
                      <Image
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="truncate font-semibold text-sm">
                          {item.course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {" "}
                          By: {item.course.instructor.name}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <ShowPrice
                          price={item.price}
                          discount_price={item?.discount_price}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="space-y-3 border-t pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-light text-sm">By:</span>
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={avatarSrc(item.course.instructor.avatar)}
                          />
                          <AvatarFallback className="text-[10px]">
                            {item.course.instructor.name}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {item.course.instructor.name}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the item from your cart
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveFromCart(item.course.id)
                                }
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        ) : (
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
        )}
      </div>

      {cart?.cart.length > 0 && (
        <>
          {/* Discount code section */}
          <Card>
            <CardTitle className="px-5">Coupon code</CardTitle>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {coupon && coupon?.discount > 0 ? (
                  <div className="flex items-center justify-between p-3 rounded-md bg-green-50 dark:bg-green-950/30">
                    <div>
                      <p className="font-medium text-green-700">
                        Coupon Applied: {coupon.code}
                      </p>
                      <p className="text-sm text-green-600">
                        Discount: {coupon.discount}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemoving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-1" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter discount code"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplyCoupon()
                      }
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !discountInput.trim()}
                    >
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals section */}
          <Card className="space-y-3 p-4 border rounded-lg">
            <div>
              <div className="flex justify-between items-center">
                <span className="">Grand total:</span>
                <span className="font-medium">${cart?.grandtotal}</span>
              </div>

              {hasDiscount && (
                <div className="flex justify-between items-center">
                  <span className="text-destructive">Discount:</span>
                  <span className="font-medium text-destructive">
                    -${cart?.grandtotal - cart.subtotal}
                  </span>
                </div>
              )}

              {coupon && coupon?.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Coupon Discount:</span>
                  <span className="font-medium">-${coupon?.discount}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold">
                  $
                  {coupon && coupon.discount > 0
                    ? coupon.final_amount.toFixed(2)
                    : cart.subtotal}
                </span>
              </div>
            </div>
          </Card>

          {/* Checkout button */}
          {!user ? (
            <Link href="/login" className="block">
              <Button className="w-full text-lg py-6 hover:scale-[1.02] transition-transform">
                Login to Checkout
              </Button>
            </Link>
          ) : (
            <Link href="/checkout" className="block">
              <Button className="w-full text-lg py-6 hover:scale-[1.02] transition-transform">
                Proceed to Checkout
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
