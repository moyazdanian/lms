"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CourseForm } from "@/components/teaching/CourseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, ClockIcon } from "lucide-react";
import { useApiResource } from "@/hooks/dashboard/useApiResource";
import { useMutation } from "@/hooks/dashboard/useMutation";
import {
  createCourse,
  getCourse,
  getInstructorQuiz,
  normalizeInstructorCourse,
  saveInstructorQuiz,
  syncCourseCurriculum,
  updateCourse,
} from "@/lib/api/instructorCourses";

function EditorSkeleton() {
  return (
    <div
      className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"
      aria-busy="true"
    >
      <div className="min-w-0 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CourseEditorPage({
  mode = "edit",
  courseId: courseIdProp,
}) {
  const [saveProgress, setSaveProgress] = useState(null);
  const params = useParams();
  const router = useRouter();
  const courseId = courseIdProp || params?.courseId;
  const isEdit = mode === "edit" && Boolean(courseId);
  const createdCourseIdRef = useRef(null);
  const originalSectionsRef = useRef([]);

  const courseQuery = useApiResource(
    ({ signal }) => getCourse(courseId, { signal }),
    [courseId],
    { enabled: isEdit },
  );

  const course = normalizeInstructorCourse(courseQuery.data);

  useEffect(() => {
    if (course) {
      originalSectionsRef.current = course.sections || [];
    }
  }, [courseQuery.data]);

  const { mutate, pending } = useMutation(async ({ values, onProgress }) => {
    const existingCourseId = courseId || createdCourseIdRef.current;

    const shouldUpdate = isEdit || Boolean(existingCourseId);

    // Course upload = first phase
    const saved = shouldUpdate
      ? await updateCourse(existingCourseId, values, (percent) => {
          onProgress?.({
            percent: Math.round(percent * 0.2),
            phase: "course",
            message: "Saving course information...",
          });
        })
      : await createCourse(values, (percent) => {
          onProgress?.({
            percent: Math.round(percent * 0.2),
            phase: "course",
            message: "Saving course information...",
          });
        });

    const savedCourse = normalizeInstructorCourse(saved);

    const savedId = savedCourse?.id;

    if (!savedId) {
      throw new Error(
        "The course was saved but the server returned no course ID.",
      );
    }

    if (!shouldUpdate) {
      createdCourseIdRef.current = savedId;
    }

    // Curriculum = remaining 80%
    await syncCourseCurriculum(
      savedId,
      values.sections || [],
      shouldUpdate ? originalSectionsRef.current : [],
      (progress) => {
        const overallPercent = 20 + progress.percent * 0.75;

        onProgress?.({
          percent: Math.round(overallPercent),
          phase: "curriculum",
          message: progress.lessonTitle
            ? progress.lessonFileName
              ? `Uploading ${progress.lessonTitle} — ${progress.lessonFileName}...`
              : `Saving ${progress.lessonTitle}...`
            : "Saving curriculum...",
          current: progress.current,
          total: progress.total,
          lessonFileName: progress.lessonFileName,
        });
      },
    );

    // Quiz = final 5% — only saved when the instructor touched it.
    const quiz = values.quiz;
    if (quiz && (quiz.is_active || (quiz.questions || []).length > 0)) {
      onProgress?.({
        percent: 95,
        phase: "quiz",
        message: "Saving quiz...",
      });

      await saveInstructorQuiz(savedId, {
        title: quiz.title || "Final Quiz",
        is_active: Boolean(quiz.is_active),
        questions: quiz.questions || [],
      });
    }

    onProgress?.({
      percent: 100,
      phase: "finalizing",
      message: "Finalizing course...",
    });

    const freshCourse = normalizeInstructorCourse(await getCourse(savedId));

    originalSectionsRef.current = freshCourse?.sections || [];

    // Refresh the quiz state so the editor shows the server-verified copy.
    try {
      const quizResponse = await getInstructorQuiz(savedId);
      const quizData = quizResponse?.data?.quiz ?? quizResponse?.quiz ?? null;
      if (quizData && freshCourse) {
        freshCourse.quiz = {
          title: quizData.title || "Final Quiz",
          is_active: Boolean(quizData.is_active),
          pass_mark: quizData.pass_mark,
          max_attempts: quizData.max_attempts,
          questions: (quizData.questions || []).map((question) => ({
            id: question.id,
            question: question.question,
            explanation: question.explanation || "",
            points: question.points || 1,
            options: (question.options || []).map((option) => ({
              option_text: option.option_text,
              is_correct: Boolean(option.is_correct),
            })),
          })),
        };
      }
    } catch {
      // Quiz fetch is best-effort; the course itself saved fine.
    }

    courseQuery.setData(freshCourse || savedCourse);

    return freshCourse || savedCourse;
  });

  async function handleSave(values) {
    setSaveProgress({
      percent: 0,
      phase: "starting",
      message: "Starting...",
    });

    try {
      const result = await mutate({
        values,
        onProgress: setSaveProgress,
      });

      if (result.ok && !isEdit) {
        router.replace(`/dashboard/teaching/courses/${result.data.id}`);
      }

      return result;
    } finally {
    }
  }

  const title = isEdit ? course?.title || "Edit course" : "Create course";
  const approvalStatus = course?.approval_status;
  const isPendingReview =
    approvalStatus === "pending_approval" || Boolean(course?.pending_approval);
  // A rejected EDIT REQUEST never unpublishes the course; the banner below
  // shows the reason while the course keeps running with its approved data.
  const isRejected = approvalStatus === "rejected";
  const hasRejectedEdit =
    approvalStatus !== "rejected" && Boolean(course?.edit_rejection_reason);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={
          isEdit
            ? "Update the details, curriculum, pricing and media for this course."
            : "Build your course in steps and save a draft whenever you need."
        }
        actions={
          <>
            {course ? (
              <StatusBadge domain="course" status={course.status} />
            ) : null}
            {course ? (
              // Lifecycle chosen by the instructor (ongoing/completed).
              <StatusBadge domain="course" status={course.backend_status} />
            ) : null}
            {course ? (
              <StatusBadge domain="approval" status={approvalStatus} />
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/dashboard/teaching">
                <ArrowLeftIcon aria-hidden="true" />
                Back to courses
              </Link>
            </Button>
          </>
        }
      />

      {isEdit && isPendingReview ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
          role="status"
        >
          <ClockIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Waiting for admin review</p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              {course?.pending_changes
                ? "Your pricing/title changes are queued for admin approval. The course keeps running with its current data until they are applied."
                : "This course is queued for admin approval. You can keep editing while you wait."}
            </p>
          </div>
        </div>
      ) : null}

      {isEdit && isRejected ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          <AlertCircleIcon
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">
              This course was rejected by admin review
            </p>
            {course?.rejection_reason ? (
              <p className="mt-1 text-red-800 dark:text-red-300">
                Reason: {course.rejection_reason}
              </p>
            ) : null}
            <p className="mt-1 text-red-800 dark:text-red-300">
              Update the course and press "Submit for review" to send it back to
              the admin queue.
            </p>
          </div>
        </div>
      ) : null}

      {isEdit && hasRejectedEdit ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200"
          role="status"
        >
          <AlertCircleIcon
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">
              Your last change request was rejected — the course keeps running
              with its current data
            </p>
            {course?.edit_rejection_reason ? (
              <p className="mt-1 text-orange-800 dark:text-orange-300">
                Reason: {course.edit_rejection_reason}
              </p>
            ) : null}
            <p className="mt-1 text-orange-800 dark:text-orange-300">
              You can update the fields and save to submit a new request for
              review.
            </p>
          </div>
        </div>
      ) : null}

      {isEdit && courseQuery.loading ? (
        <EditorSkeleton />
      ) : isEdit && courseQuery.error ? (
        <ErrorState
          title="We could not load this course"
          message={courseQuery.error.message}
          onRetry={courseQuery.refetch}
        />
      ) : (
        <CourseForm
          key={course?.id || "new-course"}
          mode={isEdit ? "edit" : "create"}
          initialValues={course || undefined}
          onSave={handleSave}
          saving={pending}
          saveProgress={saveProgress}
        />
      )}
    </div>
  );
}
