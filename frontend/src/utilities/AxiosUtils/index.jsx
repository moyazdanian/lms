import axios from "axios";

const baseURL = (process.env.NEXT_PUBLIC_API_PROD_URL || "").replace(/\/+$/, "");

export const client = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let csrfCookiePromise = null;
let csrfCookieReady = false;

/**
 * Get the CSRF cookie required by Laravel before a state-changing request.
 * The promise prevents concurrent requests from issuing duplicate CSRF calls.
 */
export async function getCsrfCookie() {
  if (typeof window === "undefined" || csrfCookieReady) {
    return;
  }

  if (!csrfCookiePromise) {
    csrfCookiePromise = client
      .get("/sanctum/csrf-cookie")
      .then(() => {
        csrfCookieReady = true;
      })
      .finally(() => {
        csrfCookiePromise = null;
      });
  }

  return csrfCookiePromise;
}

const isUnsafeMethod = (method = "get") =>
  ["post", "put", "patch", "delete"].includes(method.toLowerCase());

const send = (options) => client(options);

const request = async (options = {}) => {
  const method = options.method || "get";

  if (isUnsafeMethod(method) && options.url !== "/sanctum/csrf-cookie") {
    await getCsrfCookie();
  }

  try {
    const response = await send(options);
    return response.data;
  } catch (error) {
    // A rotated/expired CSRF token can be recovered once without exposing
    // token handling to individual API functions.
    if (error?.response?.status === 419 && isUnsafeMethod(method)) {
      csrfCookieReady = false;
      await getCsrfCookie();
      const response = await send(options);
      return response.data;
    }

    throw error;
  }
};

export default request;
