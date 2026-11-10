import React, { useEffect } from "react";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon, UploadCloudIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CourseStepNav } from "./CourseStepNav";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DetailsStep } from "./steps/DetailsStep";
import { PricingStep } from "./steps/PricingStep";
import { MediaStep } from "./steps/MediaStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CurriculumBuilder } from "./CurriculumBuilder";
import { QuizBuilder } from "./QuizBuilder";
import { useCourseForm } from "@/hooks/dashboard/useCourseForm";
import { getDraftBlockers, getPublishBlockers } from "@/lib/validation/course";
import { Progress } from "../ui/progress";

function CourseSaveProgress({ progress }) {
  if (!progress) return null;

  const percent = Math.min(100, Math.max(0, Number(progress.percent) || 0));
  const isUploadingVideo =
    progress.phase === "curriculum" && Boolean(progress.lessonFileName);
  const isSavingLesson =
    progress.phase === "curriculum" &&
    Boolean(progress.lessonTitle) &&
    !isUploadingVideo;
  const detail = isUploadingVideo
    ? `${progress.lessonFileName} · video ${progress.current || 1} of ${progress.total || 1}`
    : isSavingLesson
      ? `Lesson ${progress.current || 1} of ${progress.total || 1}`
      : progress.phase === "course"
        ? "Course information"
        : "Almost there";

  return (
    <div
      className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isUploadingVideo ? (
            <UploadCloudIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="truncate text-sm font-semibold">
              {progress.message || "Saving course..."}
            </p>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
              {percent}%
            </span>
          </div>
          <Progress
            value={percent}
            className="h-2"
            aria-label="Course save progress"
          />
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The single course form used by Create Course AND Edit Course.
 * The only difference is the `onSave` the page hands in (POST vs PUT).
 */
export function CourseForm({
  mode = "create",
  initialValues,
  onSave,
  saving,
  saveProgress,
}) {
  const form = useCourseForm({ initialValues });
  const {
    values,
    setField,
    errors,
    showErrors,
    step,
    stepIndex,
    steps,
    visitedSteps,
    goToStep,
    next,
    previous,
    isDirty,
    commit,
    setServerErrors,
  } = form;

  const visibleErrors = showErrors ? errors : {};
  const isLastStep = stepIndex === steps.length - 1;
  const published = values.status === "published";

  // Unsaved-changes warning on hard navigation / tab close.
  useEffect(() => {
    if (!isDirty) return undefined;
    function handler(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function handleSave(intent = "draft") {
    const submittingForReview = intent === "submit";
    const blockers = submittingForReview
      ? getPublishBlockers(values)
      : getDraftBlockers(values);

    if (blockers.length) {
      goToStep(steps.findIndex((item) => item.id === blockers[0].step.id));
      form.setShowErrors(true);
      toast.error(
        submittingForReview
          ? "Complete the missing information before submitting for review."
          : "Complete the required course information before saving the draft.",
      );
      return;
    }

    const result = await onSave({
      ...values,
      // Explicit save intent: 'draft' keeps the course as the instructor's
      // private draft, 'submit' places it in the admin review queue.
      intent: submittingForReview ? "submit" : "draft",
    });
    if (result?.ok) {
      commit(result.data);

      // The backend queues sensitive edits on approved courses for admin
      // review instead of applying them right away — surface that clearly.
      if (result.data?.approval_message) {
        toast.warning(result.data.approval_message, { duration: 8000 });
      } else if (
        submittingForReview &&
        result.data?.approval_status === "pending_approval"
      ) {
        // Only a course that actually sits in the admin review queue gets
        // the "submitted" toast — non-sensitive edits on a live course are
        // applied immediately and must not claim a review happened.
        toast.success("Course submitted for review");
      } else if (submittingForReview) {
        // A live course saved with no queue entry was applied directly.
        toast.success("Changes saved");
      } else if (mode === "create") {
        toast.success("Draft saved");
      } else {
        toast.success("Changes saved");
      }
      return;
    }
    if (result?.error?.errors) {
      setServerErrors(result.error.errors);
      form.setShowErrors(true);
    }
    toast.error(result?.error?.message || "We could not save this course.");
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
        <CourseStepNav
          steps={steps}
          stepIndex={stepIndex}
          values={values}
          visitedSteps={visitedSteps}
          onSelect={goToStep}
        />
      </div>

      <form
        className="min-w-0"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isLastStep) next();
        }}
        noValidate
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <CardTitle as="h2" className="mt-0.5">
                {step.label}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isDirty ? (
                <Badge variant="warning">Unsaved changes</Badge>
              ) : null}
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving || !isDirty}
                  onClick={() => handleSave("draft")}
                >
                  <SaveIcon aria-hidden="true" />
                  {saving ? "Saving…" : "Save"}
                </Button>
              ) : null}
            {/* Drafts are private to the instructor: a draft course can be
                edited and re-saved freely, and only "Submit for review" puts
                it in front of the admin. */}
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {step.id === "basics" ? (
              <BasicInfoStep
                values={values}
                setField={setField}
                errors={visibleErrors}
              />
            ) : null}
            {step.id === "details" ? (
              <DetailsStep
                values={values}
                setField={setField}
                errors={visibleErrors}
              />
            ) : null}
            {step.id === "curriculum" ? (
              <CurriculumBuilder
                sections={values.sections}
                error={visibleErrors.sections}
                onChange={(sections) => setField("sections", sections)}
              />
            ) : null}
            {step.id === "pricing" ? (
              <PricingStep
                values={values}
                setField={setField}
                errors={visibleErrors}
              />
            ) : null}
            {step.id === "media" ? (
              <MediaStep
                values={values}
                setField={setField}
                errors={visibleErrors}
              />
            ) : null}
            {step.id === "quiz" ? (
              <QuizBuilder
                quiz={values.quiz}
                saving={saving}
                onChange={(quiz) => setField("quiz", quiz)}
              />
            ) : null}
            {step.id === "review" ? (
              <ReviewStep
                values={values}
                steps={steps}
                onGoToStep={goToStep}
                mode={mode}
              />
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={previous}
            disabled={stepIndex === 0}
          >
            Back
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* A draft save only makes sense while the course does not exist
                yet — an existing course keeps its own approval state on every
                save, so edit mode only offers the explicit header "Save". */}
            {mode === "create" ? (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => handleSave("draft")}
              >
                {saving ? "Saving…" : "Save as Draft"}
              </Button>
            ) : null}
            {isLastStep ? (
              <div className="flex w-full items-center gap-4">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("submit")}
                >
                  {saving
                    ? "Saving…"
                    : published
                      ? "Save and submit update"
                      : "Submit for review"}
                </Button>
              </div>
            ) : (
              <Button type="submit">Continue</Button>
            )}
          </div>
        </div>

        {saving ? <CourseSaveProgress progress={saveProgress} /> : null}
      </form>
    </div>
  );
}
