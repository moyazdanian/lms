import { getAppliedCoupon } from "@/lib/api/coupons";
import { useQuery } from "@tanstack/react-query";

export function useCoupon(){
    return useQuery({
        queryKey: ['coupon'],
        queryFn: getAppliedCoupon,
        retry: false,
        staleTime: 0
    })
}