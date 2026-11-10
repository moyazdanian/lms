import request from "@/utilities/AxiosUtils";

// ---- Instructor course management ----

/** GET /api/v1/instructor/courses */
export function getInstructorCourses({
  page = 1,
  search = "",
  status = "all",
  category = "all",
  sort = "newest",
}) {
  return request({
    url: "/api/v1/instructor/courses",
    method: "GET",
    params: { page, search, status, category, sort },
  });
}

/** GET /api/v1/instructor/courses/{id} */
export function getInstructorCourse(courseId) {
  return request({
    url: `/api/v1/instructor/courses/${courseId}`,
    method: "GET",
  });
}

/** POST /api/v1/instructor/courses */
export function createCourseApi(formData, onProgress) {
  return request({
    url: "/api/v1/instructor/courses",
    method: "POST",
    data: formData,
    timeout: 0,
    onUploadProgress: onProgress,
  });
}

/** POST /api/v1/instructor/courses/{id} (multipart update) */
export function updateCourseApi(courseId, formData, onProgress) {
  return request({
    url: `/api/v1/instructor/courses/${courseId}`,
    method: "POST",
    data: formData,
    timeout: 0,
    onUploadProgress: onProgress,
  });
}

/** DELETE /api/v1/instructor/courses/{id} */
export function deleteCourseApi(courseId) {
  return request({
    url: `/api/v1/instructor/courses/${courseId}`,
    method: "DELETE",
  });
}

/** POST /api/v1/instructor/courses/{id}/sections */
export function createSectionApi(courseId, data) {
  return request({
    url: `/api/v1/instructor/courses/${courseId}/sections`,
    method: "POST",
    data,
  });
}

/** PUT /api/v1/instructor/sections/{id} */
export function updateSectionApi(sectionId, data) {
  return request({
    url: `/api/v1/instructor/sections/${sectionId}`,
    method: "PUT",
    data,
  });
}

/** DELETE /api/v1/instructor/sections/{id} */
export function deleteSectionApi(sectionId) {
  return request({
    url: `/api/v1/instructor/sections/${sectionId}`,
    method: "DELETE",
  });
}

/** POST /api/v1/instructor/sections/{id}/lessons */
export function createLessonApi(sectionId, formData, onProgress) {
  return request({
    url: `/api/v1/instructor/sections/${sectionId}/lessons`,
    method: "POST",
    data: formData,
    timeout: 0,
    onUploadProgress: onProgress,
  });
}

/** POST /api/v1/instructor/lessons/{id} */
export function updateLessonApi(lessonId, formData, onProgress) {
  return request({
    url: `/api/v1/instructor/lessons/${lessonId}`,
    method: "POST",
    data: formData,
    timeout: 0,
    onUploadProgress: onProgress,
  });
}

/** DELETE /api/v1/instructor/lessons/{id} */
export function deleteLessonApi(lessonId) {
  return request({
    url: `/api/v1/instructor/lessons/${lessonId}`,
    method: "DELETE",
  });
}

// ---- Instructor earnings / payouts ----

/** GET /api/v1/instructor/earnings?period= */
export function getInstructorEarnings(period = "30d") {
  return request({
    url: "/api/v1/instructor/earnings",
    method: "GET",
    params: { period },
  });
}

/** GET /api/v1/instructor/earnings/chart?period= */
export function getInstructorEarningChart(period = "30d") {
  return request({
    url: "/api/v1/instructor/earnings/chart",
    method: "GET",
    params: { period },
  });
}

/** GET /api/v1/instructor/sales/chart?period= */
export function getInstructorSalesChart(period = "30d") {
  return request({
    url: "/api/v1/instructor/sales/chart",
    method: "GET",
    params: { period },
  });
}

/** GET /api/v1/instructor/enrollment/chart?period= */
export function getInstructorEnrollmentChart(period = "30d") {
  return request({
    url: "/api/v1/instructor/enrollment/chart",
    method: "GET",
    params: { period },
  });
}

/** GET /api/v1/instructor/top-performing-courses?limit= */
export function getInstructorTopPerformingCourses(limit = 5) {
  return request({
    url: "/api/v1/instructor/top-performing-courses",
    method: "GET",
    params: { limit },
  });
}

/** GET /api/v1/instructor/recent-sales?limit= */
export function getInstructorRecentSales(limit = 10) {
  return request({
    url: "/api/v1/instructor/recent-sales",
    method: "GET",
    params: { limit },
  });
}

/** GET /api/v1/instructor/instructor-sales */
export function getInstructorSales({
  page = 1,
  search,
  status,
  courseId,
  per_page,
  period = "3m",
}) {
  return request({
    url: "/api/v1/instructor/instructor-sales",
    method: "GET",
    params: { page, search, status, courseId, per_page, period },
  });
}

/** GET /api/v1/instructor/course-options */
export function getInstructorCourseOptions() {
  return request({
    url: "/api/v1/instructor/course-options",
    method: "GET",
  });
}

/** GET /api/v1/instructor/payout-requests?page= */
export function getInstructorPayoutRequests(page = 1) {
  return request({
    url: "/api/v1/instructor/payout-requests",
    method: "GET",
    params: { page },
  });
}

/** POST /api/v1/instructor/payout-requests */
export function createInstructorPayoutRequest(data) {
  return request({
    url: "/api/v1/instructor/payout-requests",
    method: "POST",
    data,
  });
}
