/**
 * Public homepage data: section texts/visibility from the admin panel
 * (site_contents) plus the courses gated by the settings toggles.
 * Fetched with plain fetch because it runs in Server Components.
 */

import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

export async function getSiteContent() {
  const response = await fetchApi(apiUrl("/api/v1/site-content"), {
    next: {
      revalidate: 60,
      tags: ["site-content"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch site content");
  }

  const res = await response.json();

  return res?.data ?? [];
}


/**
 * The admin-picked hero courses (falls back to popular courses in page.jsx
 * when the admin has not chosen any).
 */
export function getHeroCourses(siteContentData = []) {
  const hero = siteContentData.find((item) => item.section === "hero");
  return [hero?.hero_course_1, hero?.hero_course_2].filter(Boolean);
}
