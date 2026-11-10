import { useCourseContext } from "@/contexts/CourseContext";
import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useDashboardCourses } from "@/hooks/useDashboardCourses";
import { useCertificateEligibility } from "@/hooks/quiz/useStudentQuiz";
import { useEffect, useState } from "react";

const {
  FileText,
  Download,
  FileVideo,
  LockOpen,
  Lock,
  Play,
  CheckCircle2,
  Award,
  HelpCircle,
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

export default function SectionsAndLessonsSidebar({ lesson }) {
  const course = useCourseContext();
  const { data: coursesProgress, isPending: isCoursesProgressPending } =
    useDashboardCourses();
  const { data: isEnrolled, isPending: isGettingEnrollment } =
    useCheckEnrollment(course.id, {
      enabled: !!course?.id,
    });
  // Certificate state powers the banner under the progress bar.
  const { data: certificateState } = useCertificateEligibility(course.slug, {
    enabled: Boolean(isEnrolled && course?.slug),
  });

  const [currentLesson, setCurrentLesson] = useState(
    lesson?.data ? lesson?.data : course?.sections[0]?.lessons[0],
  );
  const [openSections, setOpenSections] = useState("");

  const canAccess = isEnrolled || lesson?.data?.is_free;

  useEffect(() => {
    if (course.sections) {
      if (currentLesson) {
        const sectionId = course.sections.find((section) =>
          section.lessons?.some((lesson) => lesson.id === currentLesson.id),
        )?.id;

        if (sectionId) {
          setOpenSections([`section-${sectionId}`]);
        }
      } else {
        setOpenSections([`section-${course.sections[0]?.id}`]);
      }
    }
  }, [course, currentLesson]);
  const progress =
    coursesProgress?.data.find((c) => c.course.id === course.id)?.progress || 0;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Course Content</span>
          <Badge variant="outline">
            {course.sections?.length || 0} sections •{" "}
            {course.sections?.reduce(
              (acc, section) => acc + (section.lessons?.length || 0),
              0,
            ) || 0}{" "}
            lessons
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion
          type="multiple"
          className="w-full"
          value={openSections}
          onValueChange={setOpenSections}
        >
          {course.sections?.map((section) => (
            <AccordionItem
              key={section.id}
              value={`section-${section.id}`}
              className="border-b last:border-0"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h3 className="font-semibold text-left">{section.title}</h3>
                    <p className="text-sm text-gray-500 text-left">
                      {section.lessons?.length || 0} lessons •{" "}
                      {formatDuration(
                        section.lessons?.reduce(
                          (acc, lesson) => acc + (lesson.duration || 0),
                          0,
                        ) || 0,
                      )}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 px-2 pb-2">
                  {section.lessons?.map((lesson, lessonIndex) => (
                    <LessonItemWrapper
                      key={lesson.id}
                      canAccess={isEnrolled || lesson?.is_free}
                      href={`/courses/${course.slug}/${section.slug}/${lesson.slug}`}
                    >
                      <button
                        type="button"
                        className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between
                            ${
                              !(isEnrolled || lesson?.is_free)
                                ? "cursor-not-allowed opacity-60"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                            ${
                              currentLesson?.id === lesson.id
                                ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200"
                                : ""
                            }
                            `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              currentLesson?.id === lesson.id
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {lessonIndex + 1}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                currentLesson?.id === lesson.id
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FileVideo className="w-3 h-3" />
                              <span>
                                {formatDuration(lesson.duration || 0)}
                              </span>
                              {lesson.is_preview && (
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!(isEnrolled || lesson?.is_free) && (
                            <Lock className="w-4 h-4 text-red-600" />
                          )}

                          {lesson.is_free && !isEnrolled && (
                            <LockOpen className="w-4 h-4 text-green-500" />
                          )}

                          {lesson.progress?.status === "completed" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}

                          {currentLesson.id === lesson.id && (
                            <Play className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </button>
                    </LessonItemWrapper>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Quiz entry — visible only to enrolled students. */}
        {isEnrolled &&
          (!certificateState?.certificate ||
            certificateState.certificate.revoked_at !== null) && (
            <div className="border-t p-4">
              <Link
                href={`/courses/${course.slug}/quiz`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HelpCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">Final Quiz</p>
                    <p className="text-sm text-gray-500">
                      Pass it to earn your certificate
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Quiz</Badge>
              </Link>
            </div>
          )}
      </CardContent>
      {isEnrolled && (
        <CardFooter className="p-4 border-t">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Certificate banner — appears when issued, or hints at
                remaining requirements while still working on it. */}
            {certificateState?.certificate ? (
              <div
                className={`mt-3 rounded-lg border p-3 ${
                  certificateState.certificate?.revoked_at === null
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award
                    className={`h-5 w-5 shrink-0 ${
                      certificateState.certificate?.revoked_at === null
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    {certificateState.certificate?.revoked_at === null ? (
                      <>
                        <p className="text-sm font-medium">
                          Certificate earned —{" "}
                          {certificateState.certificate.serial}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" asChild>
                            <a href={certificateState.certificate.download_url}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/dashboard/certificates">
                              My certificates
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          This certificate was revoked by the site admin.
                        </p>
                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                          You can retake the final quiz to earn a new
                          certificate.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : certificateState?.eligible === false && progress >= 100 ? (
              <p className="mt-3 text-sm text-gray-500">
                All lessons completed — pass the final quiz to receive your
                certificate.
              </p>
            ) : null}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

const LessonItemWrapper = ({ canAccess, href, children }) => {
  if (canAccess) {
    return <Link href={href}>{children}</Link>;
  }

  return <div>{children}</div>;
};
