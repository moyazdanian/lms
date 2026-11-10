import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useRegister(){
    const {signUp} = useAuth();
    const router = useRouter()

    return useMutation({
        mutationFn: (Credentials) => signUp(Credentials),

        onSuccess: async (user) => {
            toast.success(`Welcome ${user.name || user.email}`)

            // A new account is a student, and /dashboard is the instructor
            // workspace (its RoleGuard answers 403). Mirror the login flow:
            // staff land on the dashboard, everyone else on the storefront.
            const isStaff = user?.role === 'admin' || user?.role === 'instructor';

            router.push(isStaff ? '/dashboard' : '/')
        },

        onError: (error)=>{
           error?.response?.data?.message ||
          "Register failed. Please try again."
      
        }
    })
}