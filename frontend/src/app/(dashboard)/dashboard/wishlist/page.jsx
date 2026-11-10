"use client";
import React from "react";
import { toast } from "sonner";
import { HeartIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { WishlistCard } from "@/components/account/WishlistCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getWishlist({ signal }),
  //   [],
  // );
  // const { mutate, pending } = useMutation((courseId) =>
  //   removeFromWishlist(courseId),
  // );

  const { wishlistQuery, removeFromWishlist } = useWishlist();

  const {
    data: wishlist,
    isLoading,
    isFetching,
    error,
    refetch,
  } = wishlistQuery;

  const loading = isLoading || isFetching;

  const { mutate: removeMutate, isPending: isRemoving } = removeFromWishlist;

  const items = wishlist || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" description="Courses you saved for later." />

      {loading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-video w-full rounded-b-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={HeartIcon}
          title="Your wishlist is empty."
          description="You haven't added any courses to your wishlist yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <WishlistCard
              key={item.course.id}
              item={item}
              removing={isRemoving}
              onRemove={removeMutate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
