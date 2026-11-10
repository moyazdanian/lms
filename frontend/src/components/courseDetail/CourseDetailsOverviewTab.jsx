import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { avatarSrc } from "@/lib/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Award,
  BarChart,
  CheckCircle2,
  ChevronRight,
  ListChecks,
  Tags,
  Users,
} from "lucide-react";

function normalizeList(value, { commaSeparated = false } = {}) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item);
        }

        return item?.text || item?.title || item?.name || "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const rawValue = value.trim();

  // Be tolerant if an older endpoint returns the JSON column as a string.
  try {
    const parsedValue = JSON.parse(rawValue);
    if (Array.isArray(parsedValue)) {
      return normalizeList(parsedValue, { commaSeparated });
    }
  } catch {
    // The value is plain text, so continue with the normal fallback below.
  }

  return rawValue
    .split(commaSeparated ? /[,\n]/ : /\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CourseDetailsOverviewTab({ course }) {
  const objectives = normalizeList(course?.objectives);
  const requirements = normalizeList(course?.requirements);
  const tags = normalizeList(course?.tags, { commaSeparated: true });
  const hasCourseMetadata = objectives.length || requirements.length || tags.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <Avatar className="h-14 w-14 border-2 border-white">
              <AvatarImage
                src={avatarSrc(course?.instructor?.avatar)}
                alt={course?.instructor?.name}
              />
              <AvatarFallback className="bg-blue-500 text-white">
                {course?.instructor?.name?.charAt(0) || "I"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Created by</p>
                  <h3 className="text-lg font-bold">
                    {course?.instructor?.name || "Instructor"}
                  </h3>
                </div>
                <Link href={`/instructors/${course?.instructor?.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/20"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Course Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: course?.description || "" }} />
          </div>
        </CardContent>
      </Card>

      {hasCourseMetadata > 0 && (
        <div className="space-y-6">
          {objectives.length > 0 && (
            <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:border-blue-900/50 dark:from-blue-950/40 dark:via-background dark:to-indigo-950/30">
              <CardHeader className="border-b border-blue-100/80 dark:border-blue-900/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
                    <ListChecks className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">What you&apos;ll learn</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Practical outcomes you can expect after completing this course.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                  {objectives.map((objective, index) => (
                    <div
                      key={`${objective}-${index}`}
                      className="flex items-start gap-3 rounded-lg border border-blue-100/80 bg-white/70 p-3 text-sm leading-6 dark:border-blue-900/50 dark:bg-blue-950/20"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>{objective}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {requirements.length > 0 && (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Requirements</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Everything you need before starting.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <li
                        key={`${requirement}-${index}`}
                        className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm leading-6"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          {index + 1}
                        </span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {tags.length > 0 && (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      <Tags className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Topics covered</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Explore the key topics included in this course.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800/70 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                      >
                        #{tag.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Who this course is for</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {course.level === "beginner" ? (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Beginners</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Those starting their journey in this field
                </p>
              </div>
            ) : course.level === "intermediate" ? (
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">Intermediate Learners</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Looking to enhance existing skills
                </p>
              </div>
            ) : (
              course.level === "advanced" && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Professionals</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seeking career advancement
                </p>
              </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
