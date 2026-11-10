import { HiOutlineShoppingBag, HiTrash } from "react-icons/hi2";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { CreditCard, Loader2, ShoppingCart } from "lucide-react";
import ShowPrice from "./ui/ShowPrice";
import Link from "next/link";
import { useCart } from "@/hooks/cart/useCart";
import { useRemoveFromCart } from "@/hooks/cart/useRemoveFromCart";
import NavbarCartEmptyState from "./NavbarCartEmptyState";
import Image from "next/image";
import { useClearCart } from "@/hooks/cart/useClearCart";
import { useUser } from "@/hooks/useUser";
import {
  getGuestCart,
  removeFromGuestCart,
  useGuestCart,
} from "@/hooks/cart/useGuestCart";
import { useState } from "react";

export default function NavbarCart() {
  const { data, isLoading } = useCart();
  const { guestCartQuery: guestCart, removeFromGuestCart } = useGuestCart();
  const { mutate: removeFromCart } = useRemoveFromCart();
  const { mutate: clearCart } = useClearCart();
  const { data: user } = useUser();

  const cart = !user ? guestCart.data : data;

  function handleRemove(courseId) {
    if (!user) {
      removeFromGuestCart.mutate(courseId);
    } else {
      removeFromCart(courseId);
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className="relative cursor-pointer">
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  // if (!cart) return <NavbarCartEmptyState />;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative cursor-pointer">
          <HiOutlineShoppingBag className="w-5 h-5" />
          {cart?.cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center px-1">
              {cart?.cart.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-0 border-gray-200 dark:border-gray-700 shadow-xl"
        align="end"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-lg">Shopping Cart</h3>
              </div>
              <Badge variant="outline" className="px-3">
                {cart?.cart.length} {cart?.cart.length === 1 ? "item" : "items"}
              </Badge>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-[320px] overflow-y-auto px-4">
            {cart?.cart.length > 0 ? (
              <div className="space-y-3 py-2">
                {cart?.cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                  >
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          width={64}
                          height={64}
                          quality={50}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.course.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By {item.course.instructor.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <ShowPrice
                          price={item.price}
                          discount_price={item.discount_price}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 transition-opacity"
                          onClick={() => handleRemove(item.course.id)}
                        >
                          <HiTrash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NavbarCartEmptyState />
            )}
          </div>

          {/* Footer - Only show when cart has items */}
          {cart?.cart.length > 0 && (
            <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="font-bold text-lg">${cart.subtotal}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/cart">
                      <HiOutlineShoppingBag className="w-4 h-4 mr-2" />
                      View Cart
                    </Link>
                  </Button>
                  <Button
                    className="flex-1  hover:from-blue-700 hover:to-purple-700"
                    asChild
                  >
                    <Link href="/checkout">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Checkout
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
