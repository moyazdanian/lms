import request from "@/utilities/AxiosUtils";
import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

/** GET /api/v1/settings — site name, logo, favicon... */
export function getSettings() {
  return request({
    url: "/api/v1/settings",
    method: "GET",
  });
}

/**
 * Non-throwing variant for layout-level branding (title template, favicon).
 * If the API is unreachable the layouts must still render with defaults.
 *
 * Plain fetch rather than the axios client: this runs in Server Components,
 * where the API has to be reached through API_INTERNAL_URL when the app is
 * containerised. It also keeps `next build` from failing when no API is up.
 */
export async function getSettingsSafe() {
  try {
    const response = await fetchApi(apiUrl("/api/v1/settings"), {
      cache: "no-store",
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

/** GET /api/v1/gdpr/export — full JSON export of the user's data. */
export function exportDataApi() {
  return request({
    url: "/api/v1/gdpr/export",
    method: "GET",
  });
}

/** DELETE /api/v1/gdpr/account — permanent account deletion. */
export function deleteAccountApi(password) {
  return request({
    url: "/api/v1/gdpr/account",
    method: "DELETE",
    data: { password },
  });
}
