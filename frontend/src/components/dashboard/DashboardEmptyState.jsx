import { BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function DashboardEmptyState() {
  return (
    <div className="text-center py-8">
      <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        You haven't enrolled in any courses yet.
      </p>
      <Button asChild>
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  );
}
