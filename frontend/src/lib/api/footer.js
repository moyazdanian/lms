import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

/**
 * The whole footer (about text, quick links, social links) in one payload
 * from the standalone footers table. Returns null on any failure so the
 * layout can fall back to the component's built-in defaults.
 */
export async function getFooter() {
  try {
    const response = await fetchApi(apiUrl("/api/v1/footer"), {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}
