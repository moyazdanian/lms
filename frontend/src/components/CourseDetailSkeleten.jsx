import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseDetailSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Title & Info Skeleton */}
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                
                <Skeleton className="h-12 w-3/4 mb-2" />
                <Skeleton className="h-12 w-2/3 mb-4" />
                
                <Skeleton className="h-20 w-full mb-6" />

                {/* Stats Skeleton */}
                <div className="flex flex-wrap gap-6 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>

                {/* Instructor Skeleton - Commented out in original */}
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Price & Actions Skeleton */}
              <div className="space-y-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    {/* Price Skeleton */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                    </div>

                    {/* Features Skeleton */}
                    <div className="mt-6 space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      ))}
                    </div>

                    {/* Share & Wishlist Skeleton */}
                    <div className="flex gap-2 mt-6">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </CardContent>
                </Card>

                {/* Money Back Guarantee Skeleton - Commented out in original */}
                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs Navigation Skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>

            {/* Overview Tab Content Skeleton */}
            <div className="space-y-8">
              {/* Instructor Card Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Description Card Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />

                  </div>
                </CardContent>
              </Card>

              {/* Course Metadata Skeleton */}
              <div className="space-y-6">
                {/* Learning Objectives Skeleton */}
                <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:border-blue-900/50 dark:from-blue-950/40 dark:via-background dark:to-indigo-950/30">
                  <CardHeader className="border-b border-blue-100/80 dark:border-blue-900/50">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-72 max-w-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-blue-100/80 bg-white/70 p-3 dark:border-blue-900/50 dark:bg-blue-950/20"
                        >
                          <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-full" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Requirements Skeleton */}
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-lg bg-muted/40 p-3"
                          >
                            <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                            <Skeleton className="h-5 w-full" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags Skeleton */}
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-36" />
                          <Skeleton className="h-4 w-52" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-8 w-20 rounded-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Who this course is for Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Courses Skeleton - Commented out in original */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailSkeleton;