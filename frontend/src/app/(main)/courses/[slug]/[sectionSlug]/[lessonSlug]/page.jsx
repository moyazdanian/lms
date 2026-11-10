"use client";

import LessonDetails from "@/components/courseDetail/lessons/LessonDetails";
import ForbiddenError from "@/components/error/403";
import InternalServerError from "@/components/error/500";
import LessonPageSkeleton from "@/components/LessonPageSkeleton";
import { useCourseContext } from "@/contexts/CourseContext";
import { useLesson } from "@/hooks/lesson/useLesson";
import { use } from "react";

export default function LessonPage({ params }) {
  const { slug, sectionSlug, lessonSlug } = use(params);
  const course = useCourseContext();

  const {
    data: lesson,
    isPending,
    isError,
    error,
  } = useLesson(slug, sectionSlug, lessonSlug);

  if (isPending) {
    return <LessonPageSkeleton />;
  }

  // 🔒 Auth / Permission
  if (isError) {
    if (error?.response?.status === 403) {
      return <ForbiddenError />;
    }

    return <InternalServerError />;
  }

  return (
    <div className="p-5">
      <LessonDetails course={course} lesson={lesson} />
    </div>
  );
}
