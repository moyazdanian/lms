import { addToUserCart } from "@/lib/api/cart";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { writeGuestCart } from "./cart/guestCartFunctions";
import { useRouter } from "nextjs-toploader/app";

export function useLogin() {
  const queryClient = useQueryClient();
  const { signIn } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }) =>
      signIn(email, password),

    onSuccess: async (user) => {
      try {
        toast.success(
          `Welcome back ${user.name || user.email}!`
        );

        const guestCart =
          queryClient.getQueryData(["guest-cart"]);

        if (guestCart?.cart?.length) {
          await Promise.all(
            guestCart.cart.map((item) =>
              addToUserCart(item.course.id)
            )
          );
        }

        writeGuestCart({
          cart: [],
          subtotal: 0,
        });

        queryClient.removeQueries({
          queryKey: ["guest-cart"],
        });

        // Force the cart to be fetched for the new user.
        await queryClient.invalidateQueries({
          queryKey: ["cart"],
        });

        
      } catch (error) {
        console.error(
          "Post-login synchronization failed:",
          error
        );

        toast.error(
          "Login succeeded, but some account data could not be synchronized."
        );

        // Don't redirect until the login flow is known to be complete.
        throw error;
      }

      if(user?.role === 'admin' || user.role === "instructor"){
        router.push("/dashboard");
      }else{
        router.push('/')
      }

    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    },
  });
}