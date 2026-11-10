"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useInstructorCourse,
  useSectionMutations,
  useLessonMutations,
} from "@/hooks/instructor/useInstructorCourses";

function LessonForm({ lesson = null, onSubmit, isPending, uploadProgress }) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [duration, setDuration] = useState(lesson?.duration ?? "");
  const [isFree, setIsFree] = useState(!!lesson?.is_free);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");

  const isEdit = !!lesson;

  const submit = () => {
    if (!title.trim()) {
      setError("Lesson title is required");
      return;
    }
    if (!isEdit && !videoFile) {
      setError("Video file is required");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("title", title.trim());
    if (duration !== "") formData.append("duration", duration);
    formData.append("is_free", isFree ? "1" : "0");
    if (videoFile) formData.append("video", videoFile);

    onSubmit(formData, () => {
      if (!isEdit) {
        setTitle("");
        setDuration("");
        setIsFree(false);
        setVideoFile(null);
      }
    });
  };

  return (
    <div className="space-y-3 border rounded-md p-3 bg-gray-50 dark:bg-stone-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Lesson Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction"
          />
        </div>
        <div className="space-y-1">
          <Label>Duration (minutes, optional)</Label>
          <Input
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>
          Video {isEdit ? "(leave empty to keep current video)" : ""}
        </Label>
        <Input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`is-free-${lesson?.id ?? "new"}`}
          checked={isFree}
          onCheckedChange={(checked) => setIsFree(!!checked)}
        />
        <Label htmlFor={`is-free-${lesson?.id ?? "new"}`}>
          Free preview (visible to everyone)
        </Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isPending && videoFile && (
        <div className="space-y-1">
          <Progress value={uploadProgress} />
          <p className="text-xs text-gray-500">
            Uploading video... {uploadProgress}%
          </p>
        </div>
      )}

      <Button onClick={submit} disabled={isPending} size="sm">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isEdit ? "Saving..." : "Uploading..."}
          </>
        ) : isEdit ? (
          "Save Lesson"
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" /> Add Lesson
          </>
        )}
      </Button>
    </div>
  );
}

function SectionCard({ section, courseId }) {
  const [open, setOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(section.title);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const { updateSection, deleteSection } = useSectionMutations(courseId);
  const { createLesson, updateLesson, deleteLesson, uploadProgress } =
    useLessonMutations(courseId);

  const saveTitle = () => {
    if (!titleInput.trim()) return;
    updateSection.mutate(
      { sectionId: section.id, data: { title: titleInput.trim() } },
      { onSuccess: () => setEditingTitle(false) }
    );
  };

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-3">
        {editingTitle ? (
          <div className="flex gap-2 flex-1 mr-2">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            />
            <Button size="sm" onClick={saveTitle} disabled={updateSection.isPending}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingTitle(false);
                setTitleInput(section.title);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 font-semibold flex-1 text-left"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {section.title}
            <span className="text-xs text-gray-500 font-normal">
              ({section.lessons?.length || 0} lessons)
            </span>
          </button>
        )}

        {!editingTitle && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingTitle(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete section?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{section.title}" and all of
                    its lessons and videos. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteSection.mutate(section.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {open && (
        <div className="border-t p-3 space-y-3">
          {(section.lessons || []).map((lesson) =>
            editingLessonId === lesson.id ? (
              <div key={lesson.id} className="space-y-2">
                <LessonForm
                  lesson={lesson}
                  isPending={updateLesson.isPending}
                  uploadProgress={uploadProgress}
                  onSubmit={(formData, reset) =>
                    updateLesson.mutate(
                      { lessonId: lesson.id, formData },
                      {
                        onSuccess: () => {
                          reset();
                          setEditingLessonId(null);
                        },
                      }
                    )
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingLessonId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div
                key={lesson.id}
                className="flex items-center justify-between border rounded-md p-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <PlayCircle className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="truncate">{lesson.title}</span>
                  {lesson.duration != null && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {lesson.duration} min
                    </span>
                  )}
                  {!!lesson.is_free && (
                    <Badge variant="outline" className="shrink-0">
                      Free preview
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingLessonId(lesson.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{lesson.title}" and its
                          video file.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteLesson.mutate(lesson.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          )}

          <LessonForm
            isPending={createLesson.isPending}
            uploadProgress={uploadProgress}
            onSubmit={(formData, reset) =>
              createLesson.mutate(
                { sectionId: section.id, formData },
                { onSuccess: () => reset() }
              )
            }
          />
        </div>
      )}
    </div>
  );
}

export default function CurriculumManager({ courseId }) {
  const { data: course, isPending } = useInstructorCourse(courseId);
  const { createSection } = useSectionMutations(courseId);
  const [sectionTitle, setSectionTitle] = useState("");

  const addSection = () => {
    if (!sectionTitle.trim()) return;
    createSection.mutate(
      { title: sectionTitle.trim() },
      { onSuccess: () => setSectionTitle("") }
    );
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">Curriculum</h3>
        <p className="text-sm text-gray-500">
          Organize your course into sections and upload a video for each
          lesson.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="New section title (e.g. Getting Started)"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSection()}
        />
        <Button
          onClick={addSection}
          disabled={createSection.isPending || !sectionTitle.trim()}
        >
          {createSection.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" /> Add Section
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {(course?.sections || []).map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            courseId={courseId}
          />
        ))}

        {!course?.sections?.length && (
          <p className="text-sm text-gray-500 text-center py-6 border rounded-lg border-dashed">
            No sections yet. Add your first section above.
          </p>
        )}
      </div>
    </div>
  );
}
