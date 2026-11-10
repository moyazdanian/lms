import request from "@/utilities/AxiosUtils";

/** POST /api/v1/edit-profile — multipart profile update. */
export function updateUserProfile(formData) {
  return request({
    url: "/api/v1/edit-profile",
    method: "POST",
    data: formData,
  });
}

/** GET /api/v1/instructor/instructor-profile */
export function getInstructorProfileDashboard() {
  return request({
    url: "/api/v1/instructor/instructor-profile",
    method: "GET",
  });
}

/** POST /api/v1/instructor/instructor-profile */
export function updateInstructorProfileDashboard(data) {
  return request({
    url: "/api/v1/instructor/instructor-profile",
    method: "POST",
    data,
  });
}
