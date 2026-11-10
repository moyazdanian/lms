import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";

export function useLogout() {
  const { signOut } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      toast.success("You have been logged out successfully.");
      router.push('/');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Logout failed. Please try again."
      );
    },
  });
}