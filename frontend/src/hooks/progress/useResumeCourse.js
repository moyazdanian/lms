import { getCourseResume } from "@/lib/api/enrollments";
import { useQuery } from "@tanstack/react-query";

export function useResumeCourse(slug) {
    return useQuery({
        queryKey: ['course-resume', slug],
        queryFn: async () => {
            const res = await getCourseResume(slug);
            return res;
        }
    });
}