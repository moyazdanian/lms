"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstructorPayoutRequest,
  getInstructorEarningChart,
  getInstructorEarnings,
  getInstructorEnrollmentChart,
  getInstructorPayoutRequests,
  getInstructorRecentSales,
  getInstructorSales,
  getInstructorSalesChart,
  getInstructorTopPerformingCourses,
  getInstructorCourseOptions
} from "@/lib/api/instructor";
import { toast } from "sonner";

export function useInstructorEarnings( period = "30d") {
  return useQuery({
    queryKey: ["instructor-earnings", period.preset],
    queryFn: () => getInstructorEarnings( period.preset),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorEarningChart( period = "30d") {
  return useQuery({
    queryKey: ["instructor-earnings-chart", period.preset],
    queryFn: () => getInstructorEarningChart( period.preset),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorSalesChart( period = "30d") {
  return useQuery({
    queryKey: ["instructor-sales-chart", period.preset],
    queryFn: () => getInstructorSalesChart( period.preset),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorEnrollmentChart( period = "30d") {
  return useQuery({
    queryKey: ["instructor-enrollment-chart", period.preset],
    queryFn: () => getInstructorEnrollmentChart( period.preset),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorTopPerformingCourses(limit = 5) {
  return useQuery({
    queryKey: ["instructor-top-performing-courses", limit],
    queryFn: () => getInstructorTopPerformingCourses(limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorRecentSales(limit = 10) {
  return useQuery({
    queryKey: ["instructor-recent-sales", limit],
    queryFn: () => getInstructorRecentSales(limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorSales(page = 1 , search , status , courseId , per_page , period = "3m") {
  return useQuery({
    queryKey: ["instructor-sales" , page , search , status , courseId , per_page , period],
    queryFn: () => getInstructorSales(page , search , status , courseId , per_page , period),
    placeholderData: (previousData) => previousData,
  });
}

export function useInstructorCourseOptions(){
  return useQuery({
    queryKey: ['instructor-course-options'],
    queryFn: getInstructorCourseOptions
  })
}

export function useInstructorPayoutRequests(page = 1) {
  return useQuery({
    queryKey: ["instructor-payout-requests", page],
    queryFn: () => getInstructorPayoutRequests(page),
    keepPreviousData: true,
  });
}

export function useCreateInstructorPayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createInstructorPayoutRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-payout-requests"] });
    },
    onError:(err) => {      
      toast.error(err?.response?.data?.message || 'something went wrong try again!')
    }
  });
}
