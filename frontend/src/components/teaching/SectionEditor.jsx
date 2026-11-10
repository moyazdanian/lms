import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayCircleIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LessonEditor } from "./LessonEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { formatDuration } from "@/lib/format";

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SectionEditor({
  section,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}) {
  const [lessonDialog, setLessonDialog] = useState({
    open: false,
    lesson: null,
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const lessons = section.lessons || [];

  function saveLesson(lesson) {
    const existingIndex = lessons.findIndex((item) => item.id === lesson.id);
    const nextLessons =
      existingIndex >= 0
        ? lessons.map((item, position) =>
            position === existingIndex ? lesson : item,
          )
        : [...lessons, { ...lesson, id: `l-${Date.now()}` }];
    onChange({ ...section, lessons: nextLessons });
  }

  return (
    <li className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <span className="text-xs font-semibold text-muted-foreground">
          Section {index + 1}
        </span>
        <Input
          value={section.title}
          aria-label={`Section ${index + 1} title`}
          placeholder="Section title"
          className="h-9 min-w-[180px] flex-1"
          onChange={(event) =>
            onChange({ ...section, title: event.target.value })
          }
        />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move section ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          >
            <ChevronUpIcon aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move section ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
          >
            <ChevronDownIcon aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete section ${index + 1}`}
            onClick={() => setConfirmDelete({ type: "section" })}
          >
            <Trash2Icon aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        {lessons.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No lessons in this section yet.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {lessons.map((lesson, lessonIndex) => (
              <li
                key={lesson.id}
                className="flex flex-wrap items-center gap-2 py-2 first:pt-0"
              >
                <PlayCircleIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {lesson.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDuration(lesson.duration)}
                    {lesson.video_url ? " · video attached" : " · no video yet"}
                  </span>
                </span>
                {lesson.is_free_preview ? (
                  <Badge variant="info">Free preview</Badge>
                ) : null}
                <span className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${lesson.title} up`}
                    disabled={lessonIndex === 0}
                    onClick={() =>
                      onChange({
                        ...section,
                        lessons: move(lessons, lessonIndex, lessonIndex - 1),
                      })
                    }
                  >
                    <ChevronUpIcon aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${lesson.title} down`}
                    disabled={lessonIndex === lessons.length - 1}
                    onClick={() =>
                      onChange({
                        ...section,
                        lessons: move(lessons, lessonIndex, lessonIndex + 1),
                      })
                    }
                  >
                    <ChevronDownIcon aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLessonDialog({ open: true, lesson })}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${lesson.title}`}
                    onClick={() => setConfirmDelete({ type: "lesson", lesson })}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </span>
              </li>
            ))}
          </ol>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setLessonDialog({ open: true, lesson: null })}
        >
          <PlusIcon aria-hidden="true" />
          Add lesson
        </Button>
      </div>

      <LessonEditor
        open={lessonDialog.open}
        lesson={lessonDialog.lesson}
        onOpenChange={(open) =>
          setLessonDialog((current) => ({ ...current, open }))
        }
        onSave={saveLesson}
      />

      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDelete?.type === "lesson"
                ? "Delete this lesson?"
                : "Delete this section?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.type === "lesson"
                ? `“${confirmDelete?.lesson?.title}” will be removed from this section.`
                : `“${section.title || `Section ${index + 1}`}” and its ${lessons.length} lesson(s) will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDelete?.type === "lesson") {
                  onChange({
                    ...section,
                    lessons: lessons.filter(
                      (item) => item.id !== confirmDelete.lesson.id,
                    ),
                  });
                } else {
                  onDelete();
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
