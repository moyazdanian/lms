"use client";
import { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CourseForm from "@/components/dashboard/instructor/CourseForm";
import CurriculumManager from "@/components/dashboard/instructor/CurriculumManager";

export default function CreateCourse({ onFinished }) {
  const [createdCourse, setCreatedCourse] = useState(null);

  // Step 2: course created, now build the curriculum
  if (createdCourse) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              "{createdCourse.title}" was created.
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Now add sections and upload your lesson videos. Your course will
              be published after admin approval.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <CurriculumManager courseId={createdCourse.id} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCreatedCourse(null)}>
            Create Another Course
          </Button>
          {onFinished && (
            <Button onClick={() => onFinished(createdCourse.id)}>Done</Button>
          )}
        </div>
      </div>
    );
  }

  // Step 1: course info
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info className="w-4 h-4 shrink-0" />
          Your course will be visible on the site after admin approval.
        </div>
      </CardHeader>
      <CardContent>
        <CourseForm onSuccess={(course) => setCreatedCourse(course)} />
      </CardContent>
    </Card>
  );
}
