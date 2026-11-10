import request from "@/utilities/AxiosUtils";

/** GET /api/v1/tickets?page=N */
export function getTicketsApi(page = 1) {
  return request({
    url: `/api/v1/tickets?page=${page}`,
    method: "GET",
  });
}

/** POST /api/v1/tickets */
export function createTicketApi(data) {
  return request({
    url: "/api/v1/tickets",
    method: "POST",
    data,
  });
}

/** GET /api/v1/tickets/{id} */
export function getTicketApi(id) {
  return request({
    url: `/api/v1/tickets/${id}`,
    method: "GET",
  });
}

/** POST /api/v1/tickets/{id}/messages */
export function replyTicketApi(id, body) {
  return request({
    url: `/api/v1/tickets/${id}/messages`,
    method: "POST",
    data: { body },
  });
}

/** POST /api/v1/tickets/{id}/close */
export function closeTicketApi(id) {
  return request({
    url: `/api/v1/tickets/${id}/close`,
    method: "POST",
  });
}
