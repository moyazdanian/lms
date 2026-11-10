import { getUser } from "@/lib/api/authApi";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user"],

    queryFn: async () => {
      try {
        return await getUser();
      } catch (error) {
        if (error?.response?.status === 401) {
          return null;
        }

        throw error;
      }
    },

    retry: false,

    // Always verify the current Sanctum session.
    staleTime: 30 * 1000, // 30 seconds

    // Re-check the session whenever the auth consumer mounts.
    refetchOnMount: "always",

    // Optional but useful for SPA authentication.
    refetchOnWindowFocus: false,
  });
}