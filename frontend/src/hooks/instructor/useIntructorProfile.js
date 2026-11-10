"use client";

import {
  getInstructorProfileDashboard,
  updateInstructorProfileDashboard,
} from "@/lib/api/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useInstructorProfile(){
    return useQuery({
        queryKey: ['instructor-profile-dashboard'],
        queryFn: getInstructorProfileDashboard
    })
}

export function useInstructorProfileUpdate(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateInstructorProfileDashboard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instructor-profile-dashboard"] });
            toast.success('Your Instructor Profile Details Updated!')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong. try again later!')
        }
    })
}