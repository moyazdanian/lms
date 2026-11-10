import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-white dark:bg-neutral-900 overflow-hidden"
        >
          <Skeleton className="aspect-video" />

          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-4/5" />

            <Skeleton className="h-4 w-2/3" />

            <Skeleton className="h-4 w-1/2" />

            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
