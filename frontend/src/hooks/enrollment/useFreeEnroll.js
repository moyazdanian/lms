import { enrollFreeCourse } from "@/lib/api/enrollments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * One-click enrollment in a FREE course. Invalidates the enrollment state so
 * every "Enroll" button flips to "Go to course" without a reload.
 */
export function useFreeEnroll({ redirectToCourse = false } = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (courseId) => enrollFreeCourse(courseId),
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["check-enroll", courseId] });

      if (data?.already_enrolled) {
        toast.info("You are already enrolled in this course.");
      } else {
        toast.success("You're enrolled! Start learning now.");
      }

      if (redirectToCourse && data?.course_slug) {
        router.push(`/courses/${data.course_slug}`);
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not enroll in this course.",
      );
    },
  });
}
