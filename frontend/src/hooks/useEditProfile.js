import { updateUserProfile } from "@/lib/api/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEditProfile(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (profileData) => updateUserProfile(profileData),
        onSuccess: async ({user}) => {
            queryClient.setQueryData(['user'] , user);
            toast.success('Your Profile Updated!');
        },
        onError: (error)=>{
            toast.error(error.response.data.message || "Profile update failed. Please try again.");
        }
    })
}