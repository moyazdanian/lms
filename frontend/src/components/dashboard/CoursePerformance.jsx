import React, { useState } from "react";
import { BookOpenIcon, StarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useInstructorTopPerformingCourses } from "@/hooks/instructor/useInstructorMarketplace";
import Image from "next/image";
import Link from "next/link";

/** Reusable "Top Performing Courses" panel, sortable by revenue or sales. */
export function CoursePerformance({ range, limit = 5, className }) {
  const [sortBy, setSortBy] = useState("revenue");
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getTopCourses({ range, sortBy, limit }, { signal }),
  //   [range.from, range.to, sortBy, limit],
  // );

  const { data, isPending, isFetching, error, refetch } =
    useInstructorTopPerformingCourses(limit);

  const loading = isPending || isFetching;

  const courses = data || [];

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Top Performing Courses</CardTitle>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]" aria-label="Sort courses by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">By revenue</SelectItem>
            <SelectItem value="sales">By sales</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ul className="space-y-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3">
                <Skeleton className="h-12 w-20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpenIcon}
            title="No course performance yet"
            description="Once your published courses make sales, they will be ranked here."
          />
        ) : (
          <ol className="divide-y divide-border">
            {courses.map((course, index) => (
              <li
                key={course.id}
                className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto]"
              >
                <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={80}
                    height={48}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-background/90 text-[10px] font-semibold">
                    {index + 1}
                  </span>
                </span>

                <div className="min-w-0">
                  <Link
                    href={`/dashboard/teaching/courses/${course.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{formatNumber(course.sales)} sales</span>
                    <span>{formatNumber(course.students)} students</span>
                    <span className="inline-flex items-center gap-1">
                      <StarIcon
                        className="h-3.5 w-3.5 fill-warning text-warning"
                        aria-hidden="true"
                      />

                      {course.rating.toFixed(1)}
                    </span>
                  </p>
                </div>

                <p className="col-span-2 text-sm font-semibold sm:col-span-1 sm:text-right">
                  {formatCurrency(course.revenue, course.currency)}
                  <span className="block text-xs font-normal text-muted-foreground">
                    revenue
                  </span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
