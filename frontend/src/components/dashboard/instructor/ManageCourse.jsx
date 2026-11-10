"use client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CourseForm from "@/components/dashboard/instructor/CourseForm";
import CurriculumManager from "@/components/dashboard/instructor/CurriculumManager";
import { useInstructorCourse } from "@/hooks/instructor/useInstructorCourses";

export default function ManageCourse({ courseId, onBack }) {
  const { data: course, isPending } = useInstructorCourse(courseId);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-gray-500">Course not found.</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h3 className="text-xl font-bold truncate">{course.title}</h3>
        </div>
        {course.is_active ? (
          <Badge className="bg-green-600">Published</Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Pending approval
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>

      <Separator />

      <CurriculumManager courseId={courseId} />
    </div>
  );
}
