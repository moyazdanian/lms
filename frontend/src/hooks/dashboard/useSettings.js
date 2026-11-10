import { getSettings } from "@/lib/api/settings";
import { useQuery } from "@tanstack/react-query";

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: getSettings,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    });
}