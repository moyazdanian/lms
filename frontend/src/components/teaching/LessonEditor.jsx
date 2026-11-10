"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FormField, fieldProps } from "../common/FormField";
import { LessonAttachments } from "./LessonAttachments";

const EMPTY_LESSON = {
  title: "",
  description: "",
  video_url: "",
  video_file: null,
  duration: "",
  is_free_preview: false,
};

function isFile(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}

/** Add or edit one lesson while keeping the payload compatible with Laravel. */
export function LessonEditor({ open, onOpenChange, lesson, onSave }) {
  const [values, setValues] = useState(EMPTY_LESSON);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY_LESSON, ...(lesson || {}), video_file: null });
      setErrors({});
    }
  }, [open, lesson]);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "A lesson title is required.";
    if (values.duration !== "" && Number(values.duration) < 0) {
      nextErrors.duration = "Duration cannot be negative.";
    }
    if (!lesson?.id && !isFile(values.video_file)) {
      nextErrors.video_file = "A video file is required for a new lesson.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      ...values,
      title: values.title.trim(),
      duration: values.duration === "" ? 0 : Number(values.duration),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson?.id ? "Edit lesson" : "Add lesson"}</DialogTitle>
          <DialogDescription>
            Lessons appear in the order shown inside their section.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField
            id="lesson-title"
            label="Title"
            required
            error={errors.title}
          >
            <Input
              {...fieldProps("lesson-title", errors.title)}
              value={values.title}
              placeholder="e.g. Profiling with React DevTools"
              onChange={(event) => setField("title", event.target.value)}
            />
          </FormField>

          <FormField id="lesson-description" label="Description">
            <Textarea
              id="lesson-description"
              rows={3}
              value={values.description || ""}
              placeholder="What this lesson covers."
              onChange={(event) => setField("description", event.target.value)}
            />
          </FormField>

          <FormField
            id="lesson-video"
            label="Video file"
            required={!lesson?.id}
            hint={
              lesson?.id ? "Optional replacement" : "MP4, WebM or QuickTime"
            }
            error={errors.video_file}
          >
            <Input
              id="lesson-video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) =>
                setField("video_file", event.target.files?.[0] || null)
              }
            />
            {lesson?.id && values.video_url ? (
              <p className="text-xs text-muted-foreground">
                A video is already attached. Choose a file only if you want to
                replace it.
              </p>
            ) : null}
          </FormField>

          <FormField
            id="lesson-duration"
            label="Duration"
            hint="minutes"
            error={errors.duration}
          >
            <Input
              {...fieldProps("lesson-duration", errors.duration)}
              type="number"
              min="0"
              inputMode="numeric"
              value={values.duration}
              placeholder="20"
              onChange={(event) => setField("duration", event.target.value)}
            />
          </FormField>

          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <input
              id="lesson-preview"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
              checked={Boolean(values.is_free_preview)}
              onChange={(event) =>
                setField("is_free_preview", event.target.checked)
              }
            />
            <div>
              <Label htmlFor="lesson-preview">Free preview</Label>
              <p className="text-xs text-muted-foreground">
                Anyone can watch this lesson before buying the course.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col items-stretch sm:flex-col">
          {lesson?.id ? <LessonAttachments lesson={lesson} /> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {lesson?.id ? "Save lesson" : "Add lesson"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
