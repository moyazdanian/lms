import { getUserCart } from "@/lib/api/cart";
import { useQuery } from "@tanstack/react-query";

export function useCart(){
    return useQuery({
        queryKey: ['cart'],
        queryFn: getUserCart,
        staleTime: 1000 * 60,
    })
}