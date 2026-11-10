import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInstructorApplicationApi,
  submitInstructorApplicationApi,
} from "@/lib/api/instructorApplication";

function errorMessage(err) {
  const data = err?.response?.data;

  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length) return firstField[0];
  }

  return data?.message || "Something went wrong";
}

export function useInstructorApplication() {
  const queryClient = useQueryClient();

  const applicationQuery = useQuery({
    queryKey: ["instructor-application"],
    queryFn: getInstructorApplicationApi,
  });

  const submitMutation = useMutation({
    mutationFn: submitInstructorApplicationApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-application"] });
      toast.success(data?.message || "Your application has been submitted.");
    },
    onError: (err) => {
      toast.error(errorMessage(err));
    },
  });

  return { applicationQuery, submitMutation };
}
