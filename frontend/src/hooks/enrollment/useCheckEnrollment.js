import { checkEnrollment } from "@/lib/api/enrollments";
import { useQuery } from "@tanstack/react-query";

export function useCheckEnrollment(courseId){
    return useQuery({
        queryKey: ['check-enroll' , courseId],
        queryFn: () => checkEnrollment(courseId),
        enabled: !!courseId,
        retry: 1
    })
}