import { getUserPayments, getPaymentMethods, paymentApi } from "@/lib/api/checkout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Gateways enabled in the admin panel, for rendering checkout buttons. */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await getPaymentMethods();
      return response?.methods ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function usePayment(page = 1 , search , status , perPage , period){
    const queryClient = useQueryClient();
    const userPaymentsQuery = useQuery({
        queryKey: ['payments', page , search , status , perPage , period],
        queryFn: async () => {
            const response = await getUserPayments(page , search , status , perPage , period);
            return response;
        },
    });

    const paymentQuery = useMutation({
        mutationFn: (gateway) => paymentApi(gateway),
        onSuccess: (data)=>{
            queryClient.invalidateQueries(['coupon'])

            // Free checkout (all-free cart or a 100% coupon) completes
            // synchronously — no gateway, straight to the success page.
            if(data?.success && data?.free){
                toast.success("Enrollment complete!");
                window.location.href = `/payment/success?order_id=${data.order_id}&free=1`;
                return;
            }

            // Razorpay has no hosted redirect — its Checkout JS modal opens
            // inline and posts the result back to /payment/success.
            if(data?.success && !data?.checkout_url && data?.frontend_context){
                openRazorpayCheckout(data.frontend_context);
                return;
            }

            if(data?.success && data?.checkout_url){
                window.location.href = data.checkout_url;
                return;
            }            

            toast.error(data?.message || 'something went wrong');
        },
        onError: (err)=>{            
            toast.error(err?.response?.data?.message || 'something went wrong');
        }

    })

    return {userPaymentsQuery , paymentQuery};
}

/**
 * Open Razorpay's Checkout modal inline. On success the browser is sent to
 * /payment/success with the razorpay_* fields; the server then verifies the
 * HMAC signature before granting access.
 */
function openRazorpayCheckout(context) {
    if (typeof window === "undefined" || !window.Razorpay) {
        toast.error(
            "Razorpay could not be loaded. Please refresh the page and try again."
        );
        return;
    }

    const razorpay = new window.Razorpay({
        key: context.key_id,
        amount: context.amount,
        currency: context.currency,
        name: context.name || "Course Purchase",
        description: context.description || "",
        order_id: context.razorpay_order_id,
        handler: (response) => {
            const params = new URLSearchParams({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });
            window.location.href = `/payment/success?${params.toString()}`;
        },
        modal: {
            ondismiss: () => {
                // Carry the order id so /payment/failed can cancel the pending
                // payment server-side. Without it the payment stays pending
                // forever and blocks every new checkout attempt.
                const params = new URLSearchParams({
                    razorpay_order_id: context.razorpay_order_id,
                });
                window.location.href = `/payment/failed?${params.toString()}`;
            },
        },
    });

    razorpay.open();
}