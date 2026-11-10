import request from "@/utilities/AxiosUtils";

/** POST /login (cookie session, web middleware). */
export function login(email, password) {
  return request({
    url: "/login",
    method: "POST",
    data: { email, password },
  });
}

/** POST /register */
export function register(credentials) {
  return request({
    url: "/register",
    method: "POST",
    data: credentials,
  });
}

/** POST /logout */
export function logout() {
  return request({
    url: "/logout",
    method: "POST",
  });
}

/** GET /api/v1/user — the signed-in user (unwrapped from { data }). */
export async function getUser() {
  const response = await request({
    url: "/api/v1/user",
    method: "GET",
  });

  // Laravel wraps single JsonResource responses in { data: { ... } }.
  // Unwrap so the shape matches what signIn / signUp store in the cache.
  return response.data ?? response;
}

/** POST /forgot-password */
export function forgotPassword(email) {
  return request({
    url: "/forgot-password",
    method: "POST",
    data: { email },
  });
}

/** POST /reset-password */
export function resetPassword(payload) {
  return request({
    url: "/reset-password",
    method: "POST",
    data: payload,
  });
}

/** POST /api/v1/password-reset */
export function passwordReset(data) {
  return request({
    url: "/api/v1/password-reset",
    method: "POST",
    data,
  });
}
