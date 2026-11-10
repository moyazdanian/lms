import { getReviews } from "@/lib/api/courses";
import { useQuery } from "@tanstack/react-query";

export function useReview(courseId){
    return useQuery({
        queryKey: ['review', courseId],
        queryFn: () => getReviews(courseId),
        enabled: Boolean(courseId),
        staleTime: 5 * 60 * 1000
    })
}