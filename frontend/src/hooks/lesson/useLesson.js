import { useQuery } from '@tanstack/react-query';
import { getLesson } from '@/lib/api/lessons';

export function useLesson(courseSlug, sectionSlug, lessonSlug) {
  return useQuery({
    queryKey: ['lesson', courseSlug, sectionSlug, lessonSlug],
    queryFn: () => getLesson(courseSlug, sectionSlug, lessonSlug),
    retry: false, // auth error رو دوباره نزن
  });
}