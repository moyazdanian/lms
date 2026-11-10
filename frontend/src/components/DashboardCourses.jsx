"use client";

import { useDashboardCourses } from "@/hooks/useDashboardCourses";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import DashbordCoursesSkeleton from "./dashboard/DashboardCoursesSkeleton";
import DashboardEmptyState from "./dashboard/DashboardEmptyState";
import PaginationComponent from "./PaginationComponent";

export default function DashboardCourses() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useDashboardCourses(page);

  if (isLoading) return <DashbordCoursesSkeleton />;

  if (data.data.length === 0) return <DashboardEmptyState />;
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">My Courses</h3>
      <div>
        <ul className="space-y-4">
          {data.data.map((course) => (
            <li
              key={course.id}
              className="p-3 bg-gray-100 dark:bg-gray-800 flex gap-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <img
                  src={course.course.thumbnail}
                  alt={course.course.title}
                  className="w-32 h-20 object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <Link
                  href={`/courses/${course.course.slug}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {course.course.title}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Instructor: {course.course.instructor?.name || "Unknown"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${Math.min(course.progress || 0, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-blue-600">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/courses/${course.course.slug}`}>
                      Continue
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <PaginationComponent
          currentPage={data.meta.current_page}
          totalPages={data.meta.last_page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
