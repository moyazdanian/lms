import Link from "next/link";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import { useInfiniteWishlist } from "@/hooks/useInfiniteWishlist";
import { useWishlist } from "@/hooks/useWishlist";

export default function DashboardWishlists({ state = "wishlist" }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteWishlist();
    
  const { removeFromWishlist } = useWishlist();

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <ul className="space-y-4">
        {items.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't any courses in your wishlist yet.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
        {items.map((course) => (
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
                {state === "wishlist" ? (
                  <Button
                    size="sm"
                    className="bg-red-800 text-white hover:bg-red-900"
                    onClick={() => removeFromWishlist.mutate(course.course.id)}
                  >
                    Remove from Wishlist
                  </Button>
                ) : (
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
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/courses/${course.course.slug}`}>
                    {state === "wishlist" ? "View Course" : "Continue Learning"}
                  </Link>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <div className="text-center mt-6">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
