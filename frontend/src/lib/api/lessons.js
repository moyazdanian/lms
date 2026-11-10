import request from "@/utilities/AxiosUtils";

/**
 * GET /api/v1/courses/{slug}/sections/{section}/lessons/{lesson} — the full
 * lesson payload (enforcement happens server-side).
 */
export function getLesson(courseSlug, sectionSlug, lessonSlug) {
  return request({
    url: `/api/v1/courses/${courseSlug}/sections/${sectionSlug}/lessons/${lessonSlug}`,
    method: "GET",
  });
}

/**
 * Lesson video streaming goes through the raw axios client (responseType
 * blob) so the player gets the full byte range it asks for.
 */
export function getLessonVideo(lessonId, options = {}) {
  return request({
    url: `/api/v1/lessons/${lessonId}/video`,
    method: "GET",
    responseType: "blob",
    ...options,
  });
}

/** GET /api/v1/lessons/{lesson}/attachments */
export function getLessonAttachments(lessonId) {
  return request({
    url: `/api/v1/lessons/${lessonId}/attachments`,
    method: "GET",
  });
}
