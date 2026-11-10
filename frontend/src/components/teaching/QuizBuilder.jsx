"use client";

import React, { useState } from "react";
import {
  GripVerticalIcon,
  HelpCircleIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * End-of-course quiz builder for instructors. Questions and options are
 * edited here; the pass mark and attempt limit are admin-controlled and
 * therefore not editable in this UI.
 */

const emptyQuestion = () => ({
  id: null,
  question: "",
  explanation: "",
  points: 1,
  options: [
    { option_text: "", is_correct: true },
    { option_text: "", is_correct: false },
  ],
});

function QuizQuestionEditor({ question, index, onChange, onRemove, canRemove, error }) {
  function updateOption(optionIndex, patch) {
    onChange({
      ...question,
      options: question.options.map((option, i) =>
        i === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  }

  function toggleCorrect(optionIndex, checked) {
    onChange({
      ...question,
      options: question.options.map((option, i) =>
        i === optionIndex ? { ...option, is_correct: checked } : option,
      ),
    });
  }

  function addOption() {
    if (question.options.length >= 6) return;
    onChange({
      ...question,
      options: [...question.options, { option_text: "", is_correct: false }],
    });
  }

  function removeOption(optionIndex) {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter((_, i) => i !== optionIndex),
    });
  }

  const correctCount = question.options.filter((option) => option.is_correct).length;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        error ? "border-destructive/50" : "border-border",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          {correctCount > 0 ? (
            <Badge variant="secondary">
              {correctCount} correct option{correctCount > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge variant="destructive">No correct option</Badge>
          )}
          {error ? (
            <span className="text-xs font-medium text-destructive">{error}</span>
          ) : null}
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={`Remove question ${index + 1}`}
          >
            <Trash2Icon className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        <Textarea
          value={question.question}
          onChange={(event) => onChange({ ...question, question: event.target.value })}
          placeholder="e.g. Which of the following are valid HTTP methods?"
          rows={2}
          aria-label={`Question ${index + 1} text`}
        />

        <div className="grid gap-2">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Checkbox
                id={`q${index}-o${optionIndex}`}
                checked={Boolean(option.is_correct)}
                onCheckedChange={(checked) => toggleCorrect(optionIndex, checked === true)}
                aria-label={`Mark option ${optionIndex + 1} of question ${index + 1} as correct`}
              />
              <Input
                value={option.option_text}
                onChange={(event) => updateOption(optionIndex, { option_text: event.target.value })}
                placeholder={`Option ${optionIndex + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={question.options.length <= 2}
                onClick={() => removeOption(optionIndex)}
                aria-label={`Remove option ${optionIndex + 1}`}
              >
                <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={question.options.length >= 6}
            onClick={addOption}
          >
            <PlusIcon aria-hidden="true" />
            Add option
          </Button>

          <div className="flex items-center gap-2">
            <Label htmlFor={`q${index}-points`} className="text-xs text-muted-foreground">
              Points
            </Label>
            <Input
              id={`q${index}-points`}
              type="number"
              min={1}
              max={100}
              value={question.points || 1}
              onChange={(event) => {
                const points = Math.max(1, Math.min(100, Number(event.target.value) || 1));
                onChange({ ...question, points });
              }}
              className="h-8 w-16 text-center"
            />
          </div>
        </div>

        <Input
          value={question.explanation || ""}
          onChange={(event) => onChange({ ...question, explanation: event.target.value })}
          placeholder="Explanation shown to students after they answer (optional)"
          aria-label={`Explanation for question ${index + 1}`}
        />
      </div>
    </div>
  );
}

export function QuizBuilder({ quiz, onChange, saving }) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  function setQuestions(nextQuestions) {
    onChange({ ...(quiz || {}), questions: nextQuestions });
  }

  function addQuestion() {
    setQuestions([...questions, emptyQuestion()]);
  }

  function updateQuestion(index, next) {
    setQuestions(questions.map((q, i) => (i === index ? next : q)));
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  const hasQuestions = questions.length > 0;
  const isActive = Boolean(quiz?.is_active);
  const canActivate = hasQuestions && questions.every((q) => q.question?.trim() && q.options?.some((o) => o.option_text?.trim() && o.is_correct));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border">
          <div className="min-w-0">
            <CardTitle as="h3" className="text-base">End-of-course quiz</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Students must pass this quiz (and complete every lesson) to earn the
              certificate. The pass mark and attempt limit are set by the site admin.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {isActive ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={isActive}
              disabled={!canActivate && !isActive}
              onCheckedChange={(checked) => onChange({ ...(quiz || {}), is_active: checked })}
              aria-label="Activate quiz"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title">Quiz title</Label>
            <Input
              id="quiz-title"
              value={quiz?.title || ""}
              onChange={(event) => onChange({ ...(quiz || {}), title: event.target.value })}
              placeholder="Final Quiz"
            />
          </div>

          {!hasQuestions ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
              <HelpCircleIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">No questions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first question to start building the quiz.
                </p>
              </div>
              <Button type="button" onClick={addQuestion}>
                <PlusIcon aria-hidden="true" />
                Add question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuizQuestionEditor
                  key={question.id ?? `new-${index}`}
                  question={question}
                  index={index}
                  canRemove={questions.length > 1}
                  onChange={(next) => updateQuestion(index, next)}
                  onRemove={() => removeQuestion(index)}
                  error={
                    !question.question?.trim()
                      ? "The question text is required."
                      : !question.options?.some((o) => o.option_text?.trim() && o.is_correct)
                        ? "At least one filled option must be marked correct."
                        : null
                  }
                />
              ))}

              <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <PlusIcon aria-hidden="true" />
                Add question
              </Button>
            </div>
          )}

          {isActive && !canActivate ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status">
              Every question needs text, filled options and at least one correct option
              before this quiz can stay active.
            </p>
          ) : null}

          {saving ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Saving quiz…
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
