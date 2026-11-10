"use client";
import React, { useState } from "react";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CourseFilters } from "@/components/teaching/CourseFilters";
import { CourseCard } from "@/components/teaching/CourseCard";
import { CourseTable } from "@/components/teaching/CourseTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { useDebouncedValue } from "@/hooks/dashboard/useDebouncedValue";
import Link from "next/link";
import { useInstructorCourses } from "@/hooks/instructor/useInstructorCourses";

const INITIAL_FILTERS = {
  search: "",
  status: "all",
  sort: "newest",
  page: 1,
};

export default function CoursesPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [view, setView] = useState("grid");
  const debouncedSearch = useDebouncedValue(filters.search);

  const { data, isPending , isFetching, error, refetch } = useInstructorCourses({
    search: debouncedSearch,
    status: filters.status,
    sort: filters.sort,
    page: filters.page,
  });

  const loading = isPending || isFetching;

  const courses = data?.data || [];
  const isFiltered =
    Boolean(debouncedSearch) ||
    filters.status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Create, publish and keep your course catalog up to date."
        actions={
          <Button asChild>
            <Link href="/dashboard/teaching/create">
              <PlusIcon aria-hidden="true" />
              Create Course
            </Link>
          </Button>
        }
      />

      <CourseFilters
        filters={filters}
        onChange={(patch) =>
          setFilters((current) => ({ ...current, ...patch }))
        }
        view={view}
        onViewChange={setView}
      />

      {loading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
          aria-live="polite"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-video w-full rounded-b-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title={
            isFiltered
              ? "No courses match these filters"
              : "You haven't created any courses yet."
          }
          description={
            isFiltered
              ? "Try a different search term or clear the filters."
              : "Create your first course to start teaching."
          }
          action={
            isFiltered ? (
              <Button
                variant="outline"
                onClick={() => setFilters(INITIAL_FILTERS)}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/teaching/create">
                  <PlusIcon aria-hidden="true" />
                  Create Course
                </Link>
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onChanged={refetch} />
          ))}
        </div>
      ) : (
        <CourseTable courses={courses} onChanged={refetch} />
      )}

      <Pagination
        meta={data?.meta}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </div>
  );
}
