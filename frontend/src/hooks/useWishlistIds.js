import { getWishlistIds } from "@/lib/api/wishlist";

import { useQuery } from "@tanstack/react-query";

export function useWishlistIds() {

const wishlistIdsQuery = useQuery({
        queryKey: ['wishlist-ids'],
        queryFn: async () => {
            try{
                const res = await getWishlistIds();
                return res.data;
            }catch(error){
                if(error.response?.status === 401){
                    return [];
                }
                throw error;
            }
        },

        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return { wishlistIdsQuery };
}