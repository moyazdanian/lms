"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, MessageSquare, User } from "lucide-react";
import CourseDetailsOverviewTab from "./CourseDetailsOverviewTab";
import CourseDetailsCurriculumTab from "./CourseDetailsCurriculumTab";
import CourseDetailsInstructorTab from "./CourseDetailsInstructorTab";
import CourseDetailsReviewsTab from "./CourseDetailsReviewsTab";
import SectionsAndLessonsSidebar from "./SectionsAndLessonsSidebar";

export default function CourseDetailsTabs({ course, user }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
      <TabsList className="grid grid-cols-4 dark:bg-neutral-900 w-full mb-6">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="curriculum"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          <Video className="w-4 h-4 mr-2" />
          Curriculum
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Reviews ({course.reviews?.length || 0})
        </TabsTrigger>
        <TabsTrigger
          value="instructor"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          <User className="w-4 h-4 mr-2" />
          Instructor
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-8">
        <CourseDetailsOverviewTab course={course} />
      </TabsContent>

      <TabsContent value="curriculum">
        <SectionsAndLessonsSidebar course={course} />
      </TabsContent>

      <TabsContent value="instructor">
        <CourseDetailsInstructorTab instructor={course.instructor} />
      </TabsContent>

      <TabsContent value="reviews">
        <CourseDetailsReviewsTab course={course} user={user} />
      </TabsContent>
    </Tabs>
  );
}
