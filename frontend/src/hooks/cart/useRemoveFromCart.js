import { removeFromUserCart } from "@/lib/api/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRemoveCoupon } from "../coupon/useRemoveCoupon";

export function useRemoveFromCart(){
    const {mutate} = useRemoveCoupon();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseId) => removeFromUserCart(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cart']});
            toast.success('The Course removed from cart.')
            mutate('cart_change');
        }
    })
}