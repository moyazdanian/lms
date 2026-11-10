import React, { useState } from "react";
import { HeartOffIcon, StarIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export function WishlistCard({ item, onRemove, removing }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { course } = item;
  const price = course.discount_price ? course.discount_price : course.price;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="aspect-video w-full bg-muted">
        <img
          src={course.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {course.instructor?.name}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-sm font-semibold">
            {formatCurrency(price, course.currency || "usd")}
            {course.discount_price ? (
              <span className="ml-1 text-xs font-normal text-muted-foreground line-through">
                {formatCurrency(course.price, course.currency || "usd")}
              </span>
            ) : null}
          </p>
          <p className="inline-flex items-center gap-1 text-xs font-medium">
            <StarIcon
              className="h-3.5 w-3.5 fill-warning text-warning"
              aria-hidden="true"
            />
            {/* {course.rating.toFixed(1)} */}
          </p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto gap-2 border-t border-border p-4">
        <Button className="flex-1" asChild>
          <Link href={`/courses/${course.slug}`}>View Course</Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Remove ${course.title} from wishlist`}
          disabled={removing}
          onClick={() => setConfirmOpen(true)}
        >
          <HeartOffIcon aria-hidden="true" />
        </Button>
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              “{course.title}” will no longer be saved to your wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removing}
              onClick={(event) => {
                event.preventDefault();
                onRemove(course.id, () => setConfirmOpen(false));
              }}
            >
              {removing ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
