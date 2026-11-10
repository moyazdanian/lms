import React from "react";
import { PlayIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import Link from "next/link";

export function EnrolledCourseCard({ enrollment, last_lesson }) {
  const { course, progress, lesson } = enrollment;

  const complete = progress >= 100;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
        <span className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-48">
          <img
            src={course.thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{course.title}</h3>
              <p className="text-xs text-muted-foreground">
                {course.instructor?.name}
              </p>
            </div>
            {complete ? <Badge variant="success">Completed</Badge> : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">{Number(progress)}% completed</span>
              {/* <span className="text-muted-foreground">
                {enrollment.completed_lessons} of {course.total_lessons} lessons
              </span> */}
            </div>
            <Progress
              value={progress}
              aria-label={`${course.title} progress: ${Number(progress)}% completed`}
            />
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            {lesson ? (
              <p className="min-w-0 text-xs text-muted-foreground">
                Last lesson:{" "}
                <span className="font-medium text-foreground">
                  {lesson?.title}
                </span>
                <span className="ml-2">
                  Last section:{" "}
                  <span className="font-medium text-foreground">
                    {lesson?.section?.title}
                  </span>
                </span>
              </p>
            ) : (
              <p className="min-w-0 text-xs ">
                Ready to start this course.
              </p>
            )}

            <Button size="sm" asChild>
              <Link
                href={
                  lesson
                    ? `/courses/${course.slug}/${lesson?.section?.slug}/${lesson?.slug}`
                    : `/courses/${course.slug}`
                }
              >
                <PlayIcon aria-hidden="true" />
                {complete ? "Review course" : lesson ? "Continue" : "Start course"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
