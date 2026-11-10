"use client";

import { Button } from "./ui/button";
import {
  HiOutlineShoppingCart,
  HiHeart,
  HiOutlineHeart,
  HiOutlineAcademicCap,
  HiShoppingCart,
  HiTrash,
} from "react-icons/hi2";
import { Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useWishlistIds } from "@/hooks/useWishlistIds";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { useCart } from "@/hooks/cart/useCart";
import { useUser } from "@/hooks/useUser";
import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useFreeEnroll } from "@/hooks/enrollment/useFreeEnroll";
import {
  addToGuestCart,
  getGuestCart,
  useGuestCart,
} from "@/hooks/cart/useGuestCart";
import { toast } from "sonner";
import { useState } from "react";
import { useRemoveFromCart } from "@/hooks/cart/useRemoveFromCart";
import { useCoupon } from "@/hooks/coupon/useCoupon";
import { useRemoveCoupon } from "@/hooks/coupon/useRemoveCoupon";

// Export WishlistButton و AddToCartButton به صورت جداگانه
export function WishlistButton({ course }) {
  const { wishlistQuery, addToWishlist, removeFromWishlist } = useWishlist();
  const { wishlistIdsQuery } = useWishlistIds();

  const isWishlisted = wishlistIdsQuery?.data?.includes(course.id);

  function handleClick() {
    if (isWishlisted) {
      removeFromWishlist.mutate(course.id);
    } else {
      addToWishlist.mutate(course.id);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={
        wishlistQuery.isPending ||
        addToWishlist.isPending ||
        removeFromWishlist.isPending
      }
      className="w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {wishlistQuery.isPending ||
      addToWishlist.isPending ||
      removeFromWishlist.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isWishlisted ? (
        <HiHeart className="w-4 h-4 text-red-500" />
      ) : (
        <HiOutlineHeart className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
      )}
    </button>
  );
}

export function AddToCartButton({ course }) {
  const { mutate: addToCart, isPending } = useAddToCart();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { data } = useCart();
  const {
    guestCartQuery: guestCart,
    addToGuestCart,
    removeFromGuestCart,
  } = useGuestCart();
  const { data: user } = useUser();
  const { data: coupon } = useCoupon();
  const { mutate: removeCoupon } = useRemoveCoupon();

  const cart = !user ? guestCart.data : data;

  const isInCart = cart?.cart.some((item) => item.course.id === course.id);

  function handleAddToCart() {
    if (coupon && coupon.discount > 0) {
      removeCoupon(undefined, {
        onSuccess: () => {
          toast.info("Coupon was removed because your cart was updated!");
        },
      });
    }
    if (!user) {
      addToGuestCart.mutate(course);

      return;
    }
    addToCart(course.id);
  }

  function handleRemove() {
    if (!user) {
      removeFromGuestCart.mutate(course.id);
    } else {
      removeFromCart(course.id);
    }
  }

  return (
    <Button
      onClick={isInCart ? handleRemove : handleAddToCart}
      disabled={isPending}
      size="sm"
      variant={isInCart ? "outline" : "default"}
      className="w-full flex items-center justify-center px-3 py-2"
    >
      <span className="flex items-center gap-1.5">
        {isPending || isRemoving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </>
        ) : isInCart ? (
          <div className="flex items-center justify-around gap-2">
            <div>
              <HiTrash className="text-red-500 w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs">In Cart</span>
            </div>
          </div>
        ) : (
          <>
            <HiOutlineShoppingCart className="w-3.5 h-3.5" />

            <span className="text-xs">Add</span>
          </>
        )}
      </span>
    </Button>
  );
}

/**
 * One-click enrollment button for FREE courses. Already-enrolled users get a
 * plain "Go to course" link instead.
 */
export function FreeEnrollButton({ course }) {
  const { data: isEnrolled, isPending: isChecking } = useCheckEnrollment(
    course?.id,
  );
  const { mutate: enroll, isPending } = useFreeEnroll();
  const { data: user } = useUser();

  if (isEnrolled) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center px-3 py-2"
        onClick={() => (window.location.href = `/courses/${course.slug}`)}
      >
        <span className="text-xs">Go to course</span>
      </Button>
    );
  }

  if (!user) {
    // Guests are sent to login; enrollment itself requires an account.
    return (
      <Button
        size="sm"
        className="w-full justify-center px-3 py-2"
        onClick={() => (window.location.href = "/login")}
      >
        <span className="text-xs">Enroll Free</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => enroll(course.id)}
      disabled={isPending || isChecking}
      size="sm"
      className="w-full justify-center px-3 py-2"
    >
      {isPending || isChecking ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <HiOutlineAcademicCap className="w-3.5 h-3.5" />
      )}
      <span className="ml-1.5 text-xs">Enroll Free</span>
    </Button>
  );
}

// یک default export dummy برای backward compatibility
export default function CourseClient() {
  return null;
}
