import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useUpdateLessonProgress } from "@/hooks/progress/useUpdateLessonProgress";
import { useDashboardCourses } from "@/hooks/useDashboardCourses";
import { useEffect, useRef, useState } from "react";
import SectionsAndLessonsSidebar from "./SectionsAndLessonsSidebar";
import Image from "next/image";
import { CoursePreview } from "./CoursePreview";

const {
  FileText,
  Download,
  FileVideo,
  LockOpen,
  Lock,
  Play,
  CheckCircle2,
} = require("lucide-react");
const {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} = require("../ui/card");
const { Button } = require("../ui/button");
const { Badge } = require("../ui/badge");
const {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} = require("../ui/accordion");
const { formatDuration } = require("@/lib/utils");
const { default: Link } = require("next/link");
const { Progress } = require("../ui/progress");

export default function CourseDetailsCurriculumTab({ course, lesson }) {

  const { mutate: updateLessonProgress } = useUpdateLessonProgress();

  const videoRef = useRef(null);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video || !currentLesson) return;

  //   let intervalId = null;

  //   const sendProgress = (status = "in_progress") => {
  //     if (!video.duration) return;

  //     updateLessonProgress({
  //       lessonId: currentLesson.id,
  //       payload: {
  //         course_id: course.id,
  //         watched_seconds: Math.floor(video.currentTime),
  //         status,
  //       },
  //     });
  //   };

  //   const onPlay = () => {
  //     if (intervalId) return;

  //     intervalId = setInterval(() => {
  //       sendProgress();
  //     }, 30000);
  //   };

  //   const onPause = () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //       intervalId = null;
  //     }
  //     sendProgress();
  //   };

  //   const onEnded = () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //       intervalId = null;
  //     }
  //     sendProgress("completed");
  //   };

  //   video.addEventListener("play", onPlay);
  //   video.addEventListener("pause", onPause);
  //   video.addEventListener("ended", onEnded);

  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //     video.removeEventListener("play", onPlay);
  //     video.removeEventListener("pause", onPause);
  //     video.removeEventListener("ended", onEnded);
  //   };
  // }, [currentLesson?.id]);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video || !currentLesson?.progress?.watched_seconds) return;

  //   const onLoaded = () => {
  //     video.currentTime = currentLesson.progress.watched_seconds;
  //   };

  //   video.addEventListener("loadedmetadata", onLoaded);

  //   return () => {
  //     video.removeEventListener("loadedmetadata", onLoaded);
  //   };
  // }, [currentLesson?.id]);

  return (
    <div className="">
      <div className="">
        <SectionsAndLessonsSidebar course={course} />
      </div>

      {/* Curriculum Sidebar */}
    </div>
  );
}
