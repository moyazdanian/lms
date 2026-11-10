"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCertificateEligibility,
  getQuizAttempts,
  getQuizReview,
  getStudentQuiz,
  submitQuizAttempt,
} from "@/lib/api/quiz";

/** Quiz meta + questions (no correct answers) for an enrolled student. */
export function useStudentQuiz(slug, options = {}) {
  return useQuery({
    queryKey: ["student-quiz", slug],
    queryFn: ({ signal }) => getStudentQuiz(slug, { signal }),
    enabled: Boolean(slug) && options.enabled !== false,
    retry: false,
  });
}

/** Submit an attempt; invalidates quiz + eligibility on success. */
export function useSubmitQuizAttempt(slug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers) => submitQuizAttempt(slug, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-quiz", slug] });
      queryClient.invalidateQueries({
        queryKey: ["certificate-eligibility", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", slug] });
      queryClient.invalidateQueries({ queryKey: ["quiz-review", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
  });
}

/** Attempt history for the current user. */
export function useQuizAttempts(slug, options = {}) {
  return useQuery({
    queryKey: ["quiz-attempts", slug],
    queryFn: ({ signal }) => getQuizAttempts(slug, { signal }),
    enabled: Boolean(slug) && options.enabled !== false,
  });
}

/**
 * Stored review of the user's passed attempt — powers the results-only
 * screen a passed student always lands on (refresh-safe).
 */
export function useQuizReview(slug, options = {}) {
  return useQuery({
    queryKey: ["quiz-review", slug],
    queryFn: ({ signal }) => getQuizReview(slug, { signal }),
    enabled: Boolean(slug) && options.enabled !== false,
  });
}

/** Certificate eligibility for the course banner. */
export function useCertificateEligibility(slug, options = {}) {
  return useQuery({
    queryKey: ["certificate-eligibility", slug],
    queryFn: ({ signal }) => getCertificateEligibility(slug, { signal }),
    enabled: Boolean(slug) && options.enabled !== false,
  });
}
