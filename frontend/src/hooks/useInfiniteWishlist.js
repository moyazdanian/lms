import { getWishlist } from "@/lib/api/wishlist";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteWishlist() {
    return useInfiniteQuery({
        queryKey: ['wishlist' , 'infinite'],
        queryFn: ({ pageParam }) => getWishlist(pageParam),
            
        getNextPageParam: (lastPage) => {
      if (
        lastPage?.meta &&
        lastPage.meta.current_page < lastPage.meta.last_page
      ) {
        return lastPage.meta.current_page + 1
      }
      return undefined
    },

        initialPageParam: 1,
    })
}