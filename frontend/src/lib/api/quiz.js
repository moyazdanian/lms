import request from "@/utilities/AxiosUtils";

/**
 * Student-facing quiz + certificate API.
 * All endpoints require an active enrollment (enforced server-side);
 * correct answers never leave the server before an attempt is submitted.
 */

function normalizeApiError(error) {
  const payload = error?.response?.data;
  const normalized = new Error(
    payload?.message || "We could not complete that request.",
  );
  normalized.status = error?.response?.status || 0;
  normalized.errors = payload?.errors || null;
  normalized.response = error?.response;
  return normalized;
}

async function callApi(options) {
  try {
    return await request(options);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** GET /api/v1/courses/{slug}/quiz — questions WITHOUT correct flags */
export function getStudentQuiz(slug, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/courses/${slug}/quiz`,
    method: "GET",
  });
}

/** POST /api/v1/courses/{slug}/quiz/attempts — grade + review + certificate */
export function submitQuizAttempt(slug, answers, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/courses/${slug}/quiz/attempts`,
    method: "POST",
    data: {
      answers: answers.map((answer) => ({
        question_id: answer.question_id,
        option_ids: answer.option_ids,
      })),
    },
  });
}

/** GET /api/v1/courses/{slug}/quiz/attempts — history */
export function getQuizAttempts(slug, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/courses/${slug}/quiz/attempts`,
    method: "GET",
  });
}

/** GET /api/v1/courses/{slug}/quiz/review — stored review of the passed attempt */
export function getQuizReview(slug, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/courses/${slug}/quiz/review`,
    method: "GET",
  });
}

/** GET /api/v1/courses/{slug}/certificate-eligibility */
export function getCertificateEligibility(slug, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/courses/${slug}/certificate-eligibility`,
    method: "GET",
  });
}

/** GET /api/v1/my-certificates */
export function getMyCertificates(options = {}) {
  return callApi({
    ...options,
    url: "/api/v1/my-certificates",
    method: "GET",
  });
}

/** GET /api/v1/verify-certificate/{code} — public */
export function verifyCertificate(code, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/verify-certificate/${code}`,
    method: "GET",
  });
}
