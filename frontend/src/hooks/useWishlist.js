import { addToWishlistApi, getWishlist, removeFromWishlistApi } from "@/lib/api/wishlist";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWishlist() {
    const queryClient = useQueryClient();

    const wishlistQuery = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            try{
                const res = await getWishlist();
                return res.data;
            }catch(error){
                if(error.response?.status === 401){
                    return [];
                }
                throw error;
            }
        },
        retry: false,

    })

    

    const addToWishlist = useMutation({

        mutationFn: async (courseId) => {
            await addToWishlistApi(courseId);
        },
        onMutate: async (courseId) => {
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });
            await queryClient.cancelQueries({ queryKey: ['wishlist-ids'] });

            const previousWishlist = queryClient.getQueryData(['wishlist']);
            const previousWishlistIds = queryClient.getQueryData(['wishlist-ids']);

            if(previousWishlistIds){
                queryClient.setQueryData(['wishlist-ids'], [...previousWishlistIds, courseId]);
            }

            queryClient.setQueryData(['wishlist'], (oldWishlist) => {
                return [...oldWishlist, {course: {id: courseId}}];
            });

            return { previousWishlist , previousWishlistIds };
        },
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        //     toast.success("Course added to wishlist.");
        // },
        onError: (error , _ , context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            queryClient.setQueryData(['wishlist-ids'], context.previousWishlistIds);
            error.status === 401 ? toast.error("Login is required to add to wishlist."):
            error.status === 409 ? toast.error("This course is already in your wishlist."):
            toast.error("An error occurred while adding to wishlist. Please try again later.");
        }, 
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });
        }
    })

    const removeFromWishlist = useMutation({
        mutationFn: async (courseId) => {
            await removeFromWishlistApi(courseId);
        },
        onMutate: async (courseId) => {
            await queryClient.cancelQueries({queryKey: ['wishlist']})
            await queryClient.cancelQueries({ queryKey: ['wishlist-ids'] });
            const previousWishlist = queryClient.getQueryData(['wishlist']);
            const previousWishlistIds = queryClient.getQueryData(['wishlist-ids']);

            if(previousWishlistIds){
                queryClient.setQueryData(['wishlist-ids'], previousWishlistIds.filter(id => id !== courseId));
            }

            queryClient.setQueryData(['wishlist'] , (oldWishlist) => {
                return oldWishlist.filter(item => item.course.id !== courseId);
            })

            return { previousWishlist , previousWishlistIds};
        },
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        // }

        onError: (error , _ , context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            queryClient.setQueryData(['wishlist-ids'], context.previousWishlistIds);
            toast.error("An error occurred while removing from wishlist. Please try again later.");
        }, 
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });

        }
    })

    return {wishlistQuery, addToWishlist, removeFromWishlist};
}