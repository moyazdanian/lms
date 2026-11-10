"use client";
import { useState } from "react";
import { Loader2, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useInstructorCourses,
  useCourseMutations,
} from "@/hooks/instructor/useInstructorCourses";

export default function InstructorCourses({ onManage }) {
  const [page, setPage] = useState(1);
  const { data, isPending } = useInstructorCourses(page);
  const { deleteCourse } = useCourseMutations();

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const courses = data?.data || [];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">My Courses</h3>

      {courses.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10 border rounded-lg border-dashed">
          You haven't created any courses yet. Use the "Create Course" tab to
          publish your first course.
        </p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {course.thumbnail && (
                  // plain img: API host thumbnails, avoids next/image domain issues
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full sm:w-32 h-20 object-cover rounded-md shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate">{course.title}</h4>
                    {course.is_active ? (
                      <Badge className="bg-green-600">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Pending approval
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {course.category?.name && <span>{course.category.name} · </span>}
                    ${course.discount_price ?? course.price}
                    {course.discount_price != null && (
                      <span className="line-through ml-1">${course.price}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.enrollments_count} enrolled · {course.sections_count}{" "}
                    sections
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => onManage?.(course.id)}>
                    <Pencil className="w-4 h-4 mr-1" /> Manage
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete course?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{course.title}" with all
                          sections, lessons and video files. Courses with
                          enrolled students cannot be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCourse.mutate(course.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.last_page > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm self-center">
            Page {data.current_page} of {data.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
