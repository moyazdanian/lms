import { Skeleton } from "./ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LessonPageSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 p-5">
      {/* Video Player Skeleton با انیمیشن */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="relative aspect-video bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Video controls skeleton */}
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>

        {/* Lesson Resources Skeleton با انیمیشن */}
        <Card className="mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Sidebar Skeleton با انیمیشن */}
      <div>
        <Card className="sticky top-6 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {[1, 2, 3].map((section) => (
              <div key={section} className="border-b last:border-0">
                {/* Section Header با انیمیشن */}
                <div className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>

                {/* Lessons با انیمیشن */}
                <div className="space-y-1 px-4 pb-4">
                  {[1, 2, 3].map((lesson) => (
                    <div
                      key={lesson}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-4 border-t bg-gray-50/50 dark:bg-gray-800/50">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="relative">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-1/3 absolute top-0 left-0 bg-blue-200" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-3" />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
