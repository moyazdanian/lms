import { updateLessonProgress } from "@/lib/api/enrollments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateLessonProgress() {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({lessonId , payload}) => updateLessonProgress(lessonId , payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-courses'] });
    },
  });
}