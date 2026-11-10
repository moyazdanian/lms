import { storeComment } from "@/lib/api/courses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useStoreReview(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({course_id , comment , rating , parent_id}) => storeComment(course_id , comment , rating , parent_id),
        onSuccess: () => {
            toast.success('Thanks; Your review will share, after manager confirmation!')
            queryClient.invalidateQueries({queryKey:['review']})
        },

        onError: (err) => {
            toast.error(err.response?.data?.message || 'Something went wrong!')
        }
    })
}