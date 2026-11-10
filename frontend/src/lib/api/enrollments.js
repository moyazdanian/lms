import request from "@/utilities/AxiosUtils";

/** GET /api/v1/dashboard/courses?page=N — the student's enrollments. */
export function getDashboardCourses(page = 1) {
  return request({
    url: `/api/v1/dashboard/courses?page=${page}`,
    method: "GET",
  });
}

/** GET /api/v1/course/{id}/check-enroll */
export function checkEnrollment(courseId) {
  return request({
    url: `/api/v1/course/${courseId}/check-enroll`,
    method: "GET",
  });
}

/** POST /api/v1/courses/{id}/enroll — one-click FREE course enrollment. */
export function enrollFreeCourse(courseId) {
  return request({
    url: `/api/v1/courses/${courseId}/enroll`,
    method: "POST",
  });
}

/** POST /api/v1/lessons/{lessonId}/progress */
export function updateLessonProgress(lessonId, payload) {
  return request({
    url: `/api/v1/lessons/${lessonId}/progress`,
    method: "POST",
    data: payload,
  });
}

/** GET /api/v1/courses/{slug}/resume — where the student left off. */
export function getCourseResume(slug) {
  return request({
    url: `/api/v1/courses/${slug}/resume`,
    method: "GET",
  });
}
