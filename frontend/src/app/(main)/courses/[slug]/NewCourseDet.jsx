"use client";

import CourseDetailsCurriculumTab from "@/components/courseDetail/CourseDetailsCurriculumTab";
import CourseDetailsHeroSection from "@/components/courseDetail/CourseDetailsHeorSection";
import CourseDetailsOverviewTab from "@/components/courseDetail/CourseDetailsOverviewTab";
import CourseDetailSkeleton from "@/components/CourseDetailSkeleten";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCourseContext } from "@/contexts/CourseContext";
import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useResumeCourse } from "@/hooks/progress/useResumeCourse";
import { useUpdateLessonProgress } from "@/hooks/progress/useUpdateLessonProgress";
import { useStoreReview } from "@/hooks/reviews/useStoreReview";
import { useDashboardCourses } from "@/hooks/useDashboardCourses";
import { useUser } from "@/hooks/useUser";
import { formatDate, formatDuration } from "@/lib/utils";
import { textSchema, YupObject } from "@/utilities/validation/ValidationSchema";
import { Formik } from "formik";
import {
  Award,
  BarChart,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FileVideo,
  Loader2,
  Lock,
  LockOpen,
  MessageSquare,
  Play,
  Star,
  User,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NewCourseDetails() {
  const course = useCourseContext();
  // const { data: courseResume, isPending: isCourseResumePending } =
  //   useResumeCourse(course.slug);
  // const { data: user } = useUser();
  // const { mutate: storeCommentQuery, isPending: isSubmittingReview } =
  //   useStoreReview();

  // const { data: isEnrolled, isPending: isGettingEnrollment } =
  //   useCheckEnrollment(course.id);
  // const [reply, setReply] = useState(null);
  // const [currentLesson, setCurrentLesson] = useState(
  //   course?.sections[0]?.lessons[0],
  // );
  // const [openSections, setOpenSections] = useState("");

  // function findLessonById(course, lessonId) {
  //   for (const section of course.sections) {
  //     const lesson = section.lessons.find((l) => l.id === lessonId);
  //     if (lesson) return lesson;
  //   }
  //   return null;
  // }

  // useEffect(() => {
  //   if (!course || !courseResume) return;
  //   if (courseResume.lesson_id) {
  //     const lesson = findLessonById(course, courseResume.lesson_id);
  //     if (lesson) setCurrentLesson(lesson);
  //     return;
  //   }

  //   setCurrentLesson(course.sections[0]?.lessons[0]);
  // }, [course, courseResume]);

  // const [activeTab, setActiveTab] = useState("curriculum");

  // if (isCourseResumePending) {
  //   return <CourseDetailSkeleton />;
  // }

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <CourseDetailsHeroSection course={course} />
    </div>
  );
}
