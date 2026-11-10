import request from "@/utilities/AxiosUtils";

/** GET /api/v1/notifications?page=N */
export function getNotificationsApi(page = 1) {
  return request({
    url: `/api/v1/notifications?page=${page}`,
    method: "GET",
  });
}

/** POST /api/v1/notifications/{id}/read */
export function markNotificationReadApi(id) {
  return request({
    url: `/api/v1/notifications/${id}/read`,
    method: "POST",
  });
}

/** POST /api/v1/notifications/read-all */
export function markAllNotificationsReadApi() {
  return request({
    url: "/api/v1/notifications/read-all",
    method: "POST",
  });
}
