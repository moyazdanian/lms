"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AwardIcon,
  CheckCircle2Icon,
  Loader2Icon,
  LockIcon,
  SendIcon,
  XCircleIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorState } from "@/components/common/ErrorState";
import {
  useQuizReview,
  useStudentQuiz,
  useSubmitQuizAttempt,
} from "@/hooks/quiz/useStudentQuiz";
import { cn } from "@/lib/utils";

function ScoreCircle({ score, passed, passMark }) {
  const color = passed ? "text-success" : "text-destructive";
  const circumference = 2 * Math.PI * 45;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className={cn(color, "transition-all duration-700")}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-2xl font-bold tabular-nums", color)}>
            {Math.round(score)}%
          </span>
        </div>
      </div>
      <p className={cn("text-sm font-semibold", color)}>
        {passed ? "Passed" : "Not passed"} — pass mark {passMark}%
      </p>
    </div>
  );
}

function ReviewList({ questions }) {
  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const selected = new Set(question.selected_option_ids || []);
        const correctIds = new Set(question.correct_option_ids || []);

        return (
          <div
            key={question.question_id}
            className={cn(
              "rounded-lg border p-4",
              question.is_correct
                ? "border-success/30 bg-success/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm font-medium">
                {index + 1}. {question.question}
              </p>
              {question.is_correct ? (
                <CheckCircle2Icon
                  className="h-5 w-5 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <XCircleIcon
                  className="h-5 w-5 shrink-0 text-destructive"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="space-y-1.5">
              {question.options.map((option) => {
                const isSelected = selected.has(option.id);
                const isCorrect = correctIds.has(option.id);

                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                      isCorrect && "bg-success/10 text-success",
                      isSelected &&
                        !isCorrect &&
                        "bg-destructive/10 text-destructive line-through",
                      !isCorrect && !isSelected && "text-muted-foreground",
                    )}
                  >
                    <span className="font-semibold">
                      {isSelected ? "✓" : isCorrect ? "•" : " "}
                    </span>
                    {option.option_text}
                  </div>
                );
              })}
            </div>

            {question.explanation ? (
              <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                {question.explanation}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function QuizTaker({ slug }) {
  const quizQuery = useStudentQuiz(slug);
  const submitMutation = useSubmitQuizAttempt(slug);
  const reviewQuery = useQuizReview(slug, {
    // The results screen reads the stored attempt, so the passed view
    // survives refreshes and direct navigation.
    enabled: Boolean(slug),
  });

  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);

  const quiz = quizQuery.data?.quiz;
  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  const answeredCount = Object.values(answers).filter(
    (ids) => ids && ids.length > 0,
  ).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  // Only shown when the latest submit did NOT pass — after a pass the
  // component switches to the results-only view below.
  const failedResult = submitMutation.data?.result?.passed
    ? null
    : (submitMutation.data?.result || null);

  function toggleOption(questionId, optionId) {
    setAnswers((prev) => {
      const next = new Set(prev[questionId] || []);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return { ...prev, [questionId]: [...next] };
    });
  }

  async function handleSubmit() {
    const payload = questions.map((question) => ({
      question_id: question.id,
      option_ids: answers[question.id] || [],
    }));

    try {
      await submitMutation.mutateAsync(payload);
      // On success the quiz query is invalidated and refetched; a pass
      // flips the view to the results-only screen automatically.
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Error toast handled by global mutation error handling.
    }
  }

  if (quizQuery.isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (quizQuery.isError) {
    return (
      <ErrorState
        title="Quiz unavailable"
        message={
          quizQuery.error?.status === 403
            ? "You must be enrolled in this course to take the quiz."
            : quizQuery.error?.message
        }
        onRetry={quizQuery.refetch}
      />
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <AwardIcon
            className="h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">This course has no quiz</p>
          <p className="text-sm text-muted-foreground">
            Complete every lesson to earn your certificate.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ------- Results-only view (passed — questions are closed) -------
  if (quiz.can_attempt === false) {
    const storedReview = reviewQuery.data?.result || null;
    const freshCertificate = submitMutation.data?.certificate || null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="items-center border-b border-border">
            <CardTitle>{quiz.title} — Passed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5 py-8">
            <ScoreCircle
              score={storedReview?.score ?? quiz.best_score ?? 0}
              passed
              passMark={quiz.pass_mark}
            />

            <Badge variant="secondary" className="gap-1.5">
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              You already passed this quiz — retaking is not available
            </Badge>

            <Button variant="ghost" asChild>
              <Link href={`/courses/${slug}`}>Back to course</Link>
            </Button>
          </CardContent>
        </Card>

        {freshCertificate ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4"
            role="status"
          >
            <AwardIcon
              className="mt-0.5 h-5 w-5 shrink-0 text-success"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">🎉 Your certificate is ready!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Serial {freshCertificate.serial} — you can also verify it
                publicly.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button size="sm" asChild>
                <a href={freshCertificate.download_url}>Download PDF</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/certificates">My certificates</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {storedReview?.questions?.length ? (
          <div>
            <h3 className="mb-3 text-lg font-semibold">Answer review</h3>
            <ReviewList questions={storedReview.questions} />
          </div>
        ) : null}
      </div>
    );
  }

  const question = questions[current];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions · pass mark {quiz.pass_mark}% ·{" "}
            {quiz.max_attempts === null
              ? "unlimited attempts"
              : `${quiz.attempts_remaining} of ${quiz.max_attempts} attempts left`}
          </p>
        </div>
      </div>

      {failedResult ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <XCircleIcon
            className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              Not passed — you scored {Math.round(failedResult.score)}% (pass
              mark {failedResult.pass_mark}%)
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the course material and try again.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">
              Question {current + 1} of {questions.length}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {question.points} point{question.points > 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <p className="font-medium">{question.question}</p>

          <div className="space-y-2">
            {question.options.map((option) => {
              const checked = (answers[question.id] || []).includes(option.id);

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleOption(question.id, option.id)}
                    aria-label={option.option_text}
                  />
                  {option.option_text}
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          disabled={current === 0}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Previous
        </Button>

        <div className="flex items-center gap-1.5">
          {questions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to question ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                index === current
                  ? "bg-primary"
                  : answers[questions[index].id]?.length
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((value) => value + 1)}>
            Next
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <SendIcon aria-hidden="true" />
            )}
            Submit
          </Button>
        )}
      </div>

      {!allAnswered ? (
        <p className="text-center text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered — answer every question
          to submit.
        </p>
      ) : null}

      {failedResult?.questions?.length ? (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Answer review</h3>
          <ReviewList questions={failedResult.questions} />
        </div>
      ) : null}
    </div>
  );
}
