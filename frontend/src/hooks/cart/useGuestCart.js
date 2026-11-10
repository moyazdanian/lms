import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readGuestCart, writeGuestCart } from "./guestCartFunctions";

export function useGuestCart(){
    const queryClient = useQueryClient();

    const guestCartQuery = useQuery({
    queryKey: ["guest-cart"],
    queryFn: () => readGuestCart(),
    staleTime: Infinity,
  });

  const addToGuestCart = useMutation({
    mutationFn: (course) => {
      const current = readGuestCart();

      if (current.cart.some(item => item.course.id === course.id)) {
        return current;
      }

      const newCart = [
        ...current.cart,
        {
          id: `guest-${course.id}`,
          course,
          price: course.price,
          discount_price: course.discount_price,
          final_price: course.discount_price ?? course.price,
          quantity: 1,
        },
      ];

      const data = {
        cart: newCart,
        subtotal: newCart.reduce(
          (sum, i) => sum + Number(i.final_price),
          0
        ),
      };

      writeGuestCart(data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["guest-cart"], data);
    },
  })

  const removeFromGuestCart = useMutation({
     mutationFn: (courseId) => {
      const current = readGuestCart();

      const newCart = current.cart.filter(
        item => item.course.id !== courseId
      );

      const data = {
        cart: newCart,
        subtotal: newCart.reduce(
          (sum, i) => sum + Number(i.final_price),
          0
        ),
      };

      writeGuestCart(data);
      return data;
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["guest-cart"], data);
    },
  })

  return {guestCartQuery , addToGuestCart , removeFromGuestCart}
}