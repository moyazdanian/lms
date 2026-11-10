// Public blog API. The storefront reads it from Server Components (the
// /blog pages and the homepage section), so these use plain fetch.

import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

/** GET /api/v1/blog-posts — published posts, newest first. */
export async function getBlogPosts({ page = 1, per_page = 9, search = "" } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  });

  if (search) query.set("search", search);

  const response = await fetchApi(
    apiUrl(`/api/v1/blog-posts?${query.toString()}`),
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts");
  }

  return response.json();
}

/**
 * The newest posts for the homepage. Returns an empty list when the API is
 * unreachable so a blog hiccup never takes the whole homepage down with it.
 */
export async function getLatestBlogPosts(limit = 3) {
  try {
    const json = await getBlogPosts({ per_page: limit });

    return json?.data ?? [];
  } catch {
    return [];
  }
}

/** GET /api/v1/blog-posts/{slug} — one post with its full content. */
export async function getBlogPost(slug) {
  const response = await fetchApi(
    apiUrl(`/api/v1/blog-posts/${encodeURIComponent(slug)}`),
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch blog post");
  }

  const json = await response.json();

  return json?.data ?? null;
}

/** SSR-safe variant: null for a missing post or an unreachable API. */
export async function getBlogPostSafe(slug) {
  try {
    return await getBlogPost(slug);
  } catch {
    return null;
  }
}
