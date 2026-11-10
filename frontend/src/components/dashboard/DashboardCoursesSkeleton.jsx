import { Skeleton } from "../ui/skeleton";

export default function DashbordCoursesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 bg-gray-100 dark:bg-gray-800 flex gap-2 rounded-lg shadow"
        >
          <Skeleton className="w-32 h-20 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
