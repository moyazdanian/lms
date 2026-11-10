// Admin-written legal texts (terms / privacy) and the cookie-consent banner
// copy. Each is fetched server-side by the page or layout that renders it.

import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

export async function getLegalPage(slug) {
  const res = await fetchApi(apiUrl(`/api/v1/legal-pages/${slug}`), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch legal page");
  }

  const json = await res.json();
  return json.data;
}

/** Layout/SSR-safe variant: returns null when the API is unreachable. */
export async function getLegalPageSafe(slug) {
  try {
    return await getLegalPage(slug);
  } catch {
    return null;
  }
}

/**
 * The cookie-banner copy (banner_title, banner_body, button labels, link
 * label). Returns null on failure so the banner falls back to hardcoded
 * defaults instead of breaking the layout.
 */
export async function getCookieConsentSafe() {
  return getLegalPageSafe("cookie-consent");
}
