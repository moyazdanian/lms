"use client";
import React from "react";
import { GraduationCapIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EnrolledCourseCard } from "@/components/account/EnrolledCourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboardCourses } from "@/hooks/useDashboardCourses";

export default function EnrolledCoursesPage() {
  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) => getEnrolledCourses({ signal }),
  //   [],
  // );
  const { data, isLoading, isFetching, error, refetch } = useDashboardCourses();


  const loading = isLoading || isFetching;
  const enrollments = data?.data || [];

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Enrolled Courses"
        description="Pick up where you left off."
      />

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                <Skeleton className="aspect-video w-full sm:w-48" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={GraduationCapIcon}
          title="You're not enrolled in any courses yet."
          description="Courses you buy or enroll in will show up here with your progress."
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <EnrolledCourseCard
              key={enrollment.id}
              enrollment={enrollment}
              last_lesson={data?.last_lesson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
