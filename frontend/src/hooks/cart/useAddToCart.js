import { addToUserCart } from "@/lib/api/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddToCart(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId) => addToUserCart(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cart']});
            toast.success('The Course added to cart.');
        },
        onError: (err) => {

            toast.error(err.response.data.message || 'Failed to add the course to cart. Please try again.');
        }
    })
}