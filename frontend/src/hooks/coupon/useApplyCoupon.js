import { couponApply } from "@/lib/api/coupons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useApplyCoupon(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (code) => couponApply(code),
        onSuccess: () => {
           queryClient.invalidateQueries(['cart'])
            queryClient.invalidateQueries(['coupon'])
            toast.success('Coupon applied')
        },
        onError: (err) => {
            if(err.status === 401){
                toast.error('Please login to apply coupon!')
            }else{
                toast.error(err.response?.data?.message || 'Invalid coupon')
            }            
        }
    })
}