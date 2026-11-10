"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteLessonAttachment,
  listLessonAttachments,
  updateLessonAttachment,
  uploadLessonAttachment,
} from "@/lib/api/instructorCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileType2Icon,
  LinkIcon,
  PaperclipIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

const MAX_SIZE_MB = 50;
const MAX_COUNT = 20;
const ACCEPT = ".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md";

const TYPE_META = {
  pdf: { icon: FileTextIcon, label: "PDF", className: "text-red-500" },
  zip: { icon: FileArchiveIcon, label: "ZIP", className: "text-amber-500" },
  doc: { icon: FileType2Icon, label: "Document", className: "text-blue-500" },
  slide: {
    icon: FileType2Icon,
    label: "Presentation",
    className: "text-orange-500",
  },
  sheet: {
    icon: FileSpreadsheetIcon,
    label: "Spreadsheet",
    className: "text-green-500",
  },
  text: { icon: FileTextIcon, label: "Text", className: "text-slate-500" },
  file: {
    icon: FileTextIcon,
    label: "File",
    className: "text-muted-foreground",
  },
  link: { icon: LinkIcon, label: "Link", className: "text-muted-foreground" },
};

function formatBytes(bytes) {
  const size = Number(bytes || 0);
  if (size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(
    units.length - 1,
    Math.floor(Math.log(size) / Math.log(1024)),
  );
  return `${(size / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function extensionOf(name = "") {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "zip",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "txt",
  "md",
]);

/**
 * Instructor-side attachment manager for one persisted lesson.
 * Files upload straight to the private disk; nothing is stored in the
 * curriculum form so a failed upload never blocks saving the course.
 */
export function LessonAttachments({ lesson }) {
  const lessonId = lesson?.id;
  const persisted =
    typeof lessonId === "number" || /^\d+$/.test(String(lessonId));
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [upload, setUpload] = useState(null); // { percent, fileName, error }
  const [renaming, setRenaming] = useState(null); // attachment id being renamed
  const [renameValue, setRenameValue] = useState("");
  const [actionError, setActionError] = useState(null);

  const queryKey = ["lesson-attachments", String(lessonId || "")];

  const {
    data,
    isPending,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: ({ signal }) => listLessonAttachments(lessonId, { signal }),
    enabled: persisted && Boolean(lessonId),
  });

  // Native fetch client unwraps { data } already; support both shapes.
  const attachments = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  useEffect(() => {
    setActionError(null);
    setUpload(null);
  }, [lessonId]);

  if (!persisted) {
    return (
      <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Save the course once to attach files — attachments need the lesson to
        exist on the server first.
      </p>
    );
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = extensionOf(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      setUpload({
        percent: 0,
        fileName: file.name,
        error: `Files of type .${extension || "unknown"} are not allowed.`,
      });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUpload({
        percent: 0,
        fileName: file.name,
        error: `File is larger than the ${MAX_SIZE_MB}MB limit.`,
      });
      return;
    }
    if (attachments.length >= MAX_COUNT) {
      setUpload({
        percent: 0,
        fileName: file.name,
        error: `A lesson can hold at most ${MAX_COUNT} attachments.`,
      });
      return;
    }

    setActionError(null);
    setUpload({ percent: 0, fileName: file.name, error: null });

    try {
      await uploadLessonAttachment(lessonId, file, (percent) => {
        setUpload((current) => (current ? { ...current, percent } : current));
      });
      await queryClient.invalidateQueries({ queryKey });
      setUpload(null);
    } catch (error) {
      setUpload({
        percent: 100,
        fileName: file.name,
        error: error?.message || "Upload failed. Please try again.",
      });
    }
  }

  async function handleDelete(attachmentId) {
    setActionError(null);
    try {
      await deleteLessonAttachment(attachmentId);
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      setActionError(error?.message || "Could not delete the file.");
    }
  }

  async function handleRenameSubmit(attachmentId) {
    const title = renameValue.trim();
    if (!title) {
      setRenaming(null);
      return;
    }
    setActionError(null);
    try {
      await updateLessonAttachment(attachmentId, { title });
      await queryClient.invalidateQueries({ queryKey });
      setRenaming(null);
    } catch (error) {
      setActionError(error?.message || "Could not rename the file.");
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PaperclipIcon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <h4 className="text-sm font-semibold">Lesson attachments</h4>
          <Badge variant="secondary" className="text-xs">
            {attachments.length}/{MAX_COUNT}
          </Badge>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={
            attachments.length >= MAX_COUNT || Boolean(upload && !upload.error)
          }
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon aria-hidden="true" />
          Add file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        PDF, ZIP, Word, PowerPoint, Excel, text — up to {MAX_SIZE_MB}MB each.
        Enrolled students can download them from the lesson player.
      </p>

      {upload ? (
        <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium">{upload.fileName}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {upload.error ? "Failed" : `${upload.percent}%`}
            </span>
          </div>
          {!upload.error ? (
            <Progress value={upload.percent} className="h-1.5" />
          ) : null}
          {upload.error ? (
            <p className="text-xs text-destructive">{upload.error}</p>
          ) : null}
        </div>
      ) : null}

      {actionError ? (
        <p className="text-xs text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}

      {loadError ? (
        <div className="rounded-md border border-destructive/30 p-3 text-xs text-destructive">
          <p>Could not load attachments.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {isPending && !loadError ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!isPending && attachments.length === 0 && !loadError ? (
        <Card className="border-dashed">
          <CardContent className="p-4 text-center text-xs text-muted-foreground">
            No attachments yet. Add workbooks, slides or exercise files here.
          </CardContent>
        </Card>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="divide-y divide-border">
          {attachments.map((attachment) => {
            const meta = TYPE_META[attachment.display_type] || TYPE_META.file;
            const Icon = meta.icon;
            const isRenaming = renaming === attachment.id;

            return (
              <li
                key={attachment.id}
                className="flex flex-wrap items-center gap-3 py-2"
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${meta.className}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {attachment.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {meta.label}
                    {attachment.original_name
                      ? ` · ${attachment.original_name}`
                      : ""}
                    {` · ${formatBytes(attachment.size_bytes)}`}
                    {attachment.downloads_count
                      ? ` · ${attachment.downloads_count} download(s)`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRenaming(attachment.id);
                    setRenameValue(attachment.title || "");
                  }}
                >
                  Rename
                </Button>
                <Dialog
                  open={isRenaming}
                  onOpenChange={(open) => !open && setRenaming(null)}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename attachment</DialogTitle>
                      <DialogDescription>
                        Enter a new title for this attachment.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      autoFocus
                      value={renameValue}
                      className="text-sm"
                      onKeyDown={(event) => {
                        if (event.key === "Enter")
                          handleRenameSubmit(attachment.id);
                        if (event.key === "Escape") setRenaming(null);
                      }}
                      onChange={(event) => setRenameValue(event.target.value)}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setRenaming(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleRenameSubmit(attachment.id)}
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${attachment.title}`}
                  onClick={() => handleDelete(attachment.id)}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
