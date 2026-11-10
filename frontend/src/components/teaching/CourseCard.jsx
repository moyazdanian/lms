import React from "react";
import { UsersIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { StatusBadge } from "../common/StatusBadge";
import { CourseActions } from "./CourseActions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";

export function CourseCard({ course, onChanged }) {
  const finalPrice = course.discount_price ?? course.price;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={course.thumbnail}
          alt=""
          loading="lazy"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover"
        />

        <span className="absolute left-3 top-3 flex flex-col items-start gap-1">
          <StatusBadge domain="course" status={course.status} />
          <StatusBadge domain="approval" status={course.approval_status} />
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {course.category?.name ||
                course.category_id?.name ||
                "Uncategorized"}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
              <Link
                href={`/dashboard/teaching/courses/${course.id}`}
                className="hover:underline"
              >
                {course.title}
              </Link>
            </h3>
          </div>
          <CourseActions course={course} onChanged={onChanged} />
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-medium">
              {formatCurrency(finalPrice, course.currency)}
              {course.discount_price ? (
                <span className="ml-1 text-muted-foreground line-through">
                  {formatCurrency(course.price, course.currency)}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sales</dt>
            <dd className="font-medium">{formatNumber(course.sales)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Students</dt>
            <dd className="inline-flex items-center gap-1 font-medium">
              <UsersIcon
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              {formatNumber(course.enrollments_count)}
            </dd>
          </div>
          {/* <div>
            <dt className="text-muted-foreground">Rating</dt>
            <dd className="inline-flex items-center gap-1 font-medium">
              <StarIcon className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
              {course.rating ? course.rating.toFixed(1) : 'Not rated'}
            </dd>
          </div> */}
        </dl>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          Updated {formatDate(course.updated_at)}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/teaching/courses/${course.id}`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
