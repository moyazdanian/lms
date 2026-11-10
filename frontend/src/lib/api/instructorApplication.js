import request from "@/utilities/AxiosUtils";

/** GET /api/v1/instructor-application */
export function getInstructorApplicationApi() {
  return request({
    url: "/api/v1/instructor-application",
    method: "GET",
  });
}

/** POST /api/v1/instructor-application */
export function submitInstructorApplicationApi(data) {
  return request({
    url: "/api/v1/instructor-application",
    method: "POST",
    data,
  });
}
