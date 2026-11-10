import React from "react";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { categoryLabel, levelLabel } from "@/config/courses";
import { finalPrice, getPublishBlockers } from "@/lib/validation/course";
import { formatCurrency, formatDuration } from "@/lib/format";

export function ReviewStep({ values, onGoToStep, steps, mode }) {
  const blockers = getPublishBlockers(values);
  const lessons = (values.sections || []).flatMap(
    (section) => section.lessons || [],
  );
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + Number(lesson.duration || 0),
    0,
  );

  return (
    <div className="space-y-5">
      {blockers.length === 0 ? (
        <div className="flex items-start gap-3 rounded-md border border-success/25 bg-success/5 p-4">
          <CheckCircle2Icon
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold">
              This course is ready to submit
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Everything required is complete. You can still save it as a draft."
                : "Everything required is complete. You can submit it for update."}
            </p>
          </div>
        </div>
      ) : (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-4"
        >
          <AlertTriangleIcon
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />

          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold">
              {blockers.length} step{blockers.length === 1 ? "" : "s"} still
              need attention before submission
            </p>
            <ul className="space-y-1.5 text-sm">
              {blockers.map(({ step, errors }) => (
                <li
                  key={step.id}
                  className="flex flex-wrap items-center gap-x-2"
                >
                  <span className="font-medium">{step.label}:</span>
                  <span className="text-muted-foreground">
                    {errors.join(" ")}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() =>
                      onGoToStep(steps.findIndex((item) => item.id === step.id))
                    }
                  >
                    Fix now
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <span className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-48">
              {values.thumbnail ? (
                <img
                  src={values.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>
            <div className="min-w-0 space-y-2">
              <h3 className="text-base font-semibold">
                {values.title || "Untitled course"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {values.short_description || "No short description yet."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {values.category_name || categoryLabel(values.category)}
                </Badge>
                <Badge variant="secondary">{levelLabel(values.level)}</Badge>
                <Badge variant="outline">
                  {formatCurrency(finalPrice(values), values.currency)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Sections</dt>
              <dd className="font-semibold">{values.sections?.length || 0}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lessons</dt>
              <dd className="font-semibold">{lessons.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total length</dt>
              <dd className="font-semibold">{formatDuration(totalDuration)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Free previews</dt>
              <dd className="font-semibold">
                {lessons.filter((lesson) => lesson.is_free_preview).length}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">End-of-course quiz</p>
              <p className="text-sm text-muted-foreground">
                {values.quiz?.is_active
                  ? `${values.quiz.questions?.length || 0} question(s) — active. Students must pass it to earn the certificate.`
                  : (values.quiz?.questions?.length || 0) > 0
                    ? `${values.quiz.questions.length} question(s) saved — currently inactive.`
                    : "No quiz — certificates will be issued after all lessons are completed."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onGoToStep(steps.findIndex((item) => item.id === "quiz"))
              }
            >
              Edit quiz
            </Button>
          </div>

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">Learning objectives</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(values.objectives || []).filter(Boolean).length ? (
                  values.objectives
                    .filter(Boolean)
                    .map((objective) => <li key={objective}>• {objective}</li>)
                ) : (
                  <li>None added yet.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Requirements</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(values.requirements || []).filter(Boolean).length ? (
                  values.requirements
                    .filter(Boolean)
                    .map((requirement) => (
                      <li key={requirement}>• {requirement}</li>
                    ))
                ) : (
                  <li>None added yet.</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
