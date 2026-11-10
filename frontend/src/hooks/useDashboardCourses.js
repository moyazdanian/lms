import { getDashboardCourses } from "@/lib/api/enrollments";
import { useQuery } from "@tanstack/react-query";

export function useDashboardCourses(page = 1){
    return useQuery({
        queryKey: ['dashboard-courses' , page],
        queryFn:async () => {
            const res =await getDashboardCourses(page)            
            return res;
        },
        keepPreviousData: true,
    })
}