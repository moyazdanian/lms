import { removeCoupon } from "@/lib/api/coupons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useRemoveCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(['coupon'])
    }
  })
}
