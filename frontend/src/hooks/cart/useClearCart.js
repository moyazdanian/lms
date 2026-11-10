import { clearUserCart } from "@/lib/api/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useClearCart(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearUserCart,
        onSuccess: () => {
            queryClient.setQueryData(['cart'], null);
            toast.success('The cart has been cleared.');
        }
    })
}