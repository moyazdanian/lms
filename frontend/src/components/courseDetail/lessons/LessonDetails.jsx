import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useUpdateLessonProgress } from "@/hooks/progress/useUpdateLessonProgress";
import { useDashboardCourses } from "@/hooks/useDashboardCourses";
import { useEffect, useRef, useState } from "react";
import SectionsAndLessonsSidebar from "@/components/courseDetail/SectionsAndLessonsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileText,
  FileArchive,
  FileType2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonPageSkeleton from "@/components/LessonPageSkeleton";

export default function LessonDetails({ course, lesson }) {
  const { data: isEnrolled, isPending: isPendingEnroll } = useCheckEnrollment(
    course.id,
  );
  const { mutate: updateLessonProgress } = useUpdateLessonProgress();

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lesson?.data?.id) return;

    if (!isEnrolled) return;

    const lessonId = lesson.data.id;

    // Heartbeat: send at most every 30s (timed from the last sent tick) so
    // watched_seconds keeps saving while the video plays, not just on pause
    // or at the very end.
    let lastSentAt = 0;
    let lastSentSecond = -1;
    let endedSent = false;

    const sendProgress = (status = "in_progress") => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      if (Number.isNaN(video.currentTime)) return;

      lastSentAt = Date.now();

      updateLessonProgress({
        lessonId,
        payload: {
          // course_id is derived server-side from the lesson; sending it is
          // unnecessary and only misleads readers.
          watched_seconds: Math.floor(video.currentTime),
          status,
        },
      });
    };

    // timeupdate fires ~4x/second while playing; this handler doubles as the
    // heartbeat (every 30s) AND the 80% auto-complete trigger — so a student
    // who closes the tab near the end still gets credit.
    const onTimeUpdate = () => {
      const second = Math.floor(video.currentTime);

      if (video.duration > 0 && second / video.duration >= 0.8) {
        if (!endedSent) {
          endedSent = true;
          sendProgress("completed");
        }
        return;
      }

      const now = Date.now();
      if (now - lastSentAt >= 30000 && second !== lastSentSecond) {
        lastSentSecond = second;
        sendProgress("in_progress");
      }
    };

    const onPlay = () => {
      // Immediately persist the resume position when playback starts.
      sendProgress("in_progress");
    };

    const onPause = () => sendProgress("in_progress");

    const onEnded = () => {
      endedSent = true;
      sendProgress("completed");
    };

    const onBeforeUnload = () => sendProgress("in_progress");

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    // Closing/refreshing the tab flushes the current position — a best-effort
    // sendBeacon-style save (the regular request may not complete).
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // isEnrolled MUST be a dependency: the enrollment query resolves after
    // mount, and without it the listeners would attach with a stale closure
    // and progress would never save.
  }, [lesson?.data?.id, isEnrolled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lesson?.data?.progress?.watched_seconds) return;

    const onLoaded = () => {
      video.currentTime = lesson.data.progress.watched_seconds;
    };

    video.addEventListener("loadedmetadata", onLoaded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [lesson?.data?.id]);

  // if (isPendingEnroll) return <LessonPageSkeleton />;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={lesson?.data?.video_url}
              controls
              // crossOrigin="use-credentials"
              preload="metadata"
              className="w-full h-full"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4">
            <h2 className="text-xl font-bold mb-2">
              {lesson?.data?.description || "Introduction"}
            </h2>
          </div>
        </div>

        {/* Lesson attachments — only rendered for enrolled buyers; the API
            omits them for free previews and non-enrolled visitors. */}
        {lesson?.data?.attachments?.length > 0 && isEnrolled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lesson attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lesson.data.attachments.map((attachment) => {
                  const iconByType = {
                    pdf: FileText,
                    zip: FileArchive,
                    doc: FileType2,
                    slide: FileType2,
                    sheet: FileSpreadsheet,
                  };
                  const Icon = iconByType[attachment.display_type] || FileText;
                  const sizeBytes = Number(attachment.size_bytes || 0);
                  const sizeLabel =
                    sizeBytes > 0
                      ? ` • ${
                          sizeBytes > 1024 * 1024
                            ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                            : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
                        }`
                      : "";

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {attachment.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {attachment.display_type}
                            {sizeLabel}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={attachment.download_url}
                          download={
                            attachment.original_name || attachment.title
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div>
        <SectionsAndLessonsSidebar course={course} lesson={lesson} />
      </div>
    </div>
  );
}
