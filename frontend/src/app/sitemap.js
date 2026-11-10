import { apiUrl } from "@/lib/api/baseUrl";
import { fetchApi } from "@/lib/api/fetchApi";
import { absoluteUrl } from "@/lib/siteUrl";

// Courses, categories, instructors and posts are edited in the admin panel at
// any time, and the image is built while no API is running, so the sitemap is
// produced per request instead of being frozen at build time.
export const dynamic = "force-dynamic";

// Endpoint page-size limits: /courses caps per_page at 100, /blog-posts at 24.
const COURSES_PER_PAGE = 100;
const POSTS_PER_PAGE = 24;
// A hard stop so a huge install cannot turn one request into hundreds of API
// calls. 50 pages is 5,000 courses / 1,200 posts.
const MAX_PAGES = 50;

async function getJson(path) {
  try {
    const response = await fetchApi(apiUrl(path), { cache: "no-store" });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    // An unreachable API must not fail the whole sitemap: the static pages are
    // still worth serving.
    return null;
  }
}

/** Every item of a paginated endpoint ([] when it cannot be read). */
async function getAllItems(path, perPage) {
  const first = await getJson(`${path}?per_page=${perPage}&page=1`);

  if (!first) return [];

  const lastPage = Math.min(
    Math.max(Number(first?.meta?.last_page) || 1, 1),
    MAX_PAGES,
  );

  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      getJson(`${path}?per_page=${perPage}&page=${index + 2}`),
    ),
  );

  return [first, ...rest]
    .filter(Boolean)
    .flatMap((json) => json?.data ?? []);
}

/** Array response (not paginated) — /api/v1/allcategories and /instructors. */
async function getCollection(path) {
  const json = await getJson(path);

  if (!json) return [];

  return Array.isArray(json) ? json : (json?.data ?? []);
}

const slug = (value) => encodeURIComponent(String(value));
const stamp = (value) => (value ? new Date(value) : undefined);

export default async function sitemap() {
  const [courses, categories, instructors, posts] = await Promise.all([
    getAllItems("/api/v1/courses", COURSES_PER_PAGE),
    getCollection("/api/v1/allcategories"),
    getCollection("/api/v1/instructors"),
    getAllItems("/api/v1/blog-posts", POSTS_PER_PAGE),
  ]);

  const pages = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/courses", changeFrequency: "daily", priority: 0.9 },
    { path: "/instructors", changeFrequency: "weekly", priority: 0.7 },
    { path: "/blog", changeFrequency: "daily", priority: 0.8 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.2 },
  ].map(({ path, ...rest }) => ({ url: absoluteUrl(path), ...rest }));

  const courseUrls = courses
    .filter((course) => course?.slug)
    .map((course) => ({
      url: absoluteUrl(`/courses/${slug(course.slug)}`),
      lastModified: stamp(course.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryUrls = categories
    .filter((category) => category?.slug)
    .map((category) => ({
      url: absoluteUrl(`/categories/${slug(category.slug)}`),
      lastModified: stamp(category.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const instructorUrls = instructors
    .filter((instructor) => instructor?.id)
    .map((instructor) => ({
      url: absoluteUrl(`/instructors/${slug(instructor.id)}`),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  const postUrls = posts
    .filter((post) => post?.slug)
    .map((post) => ({
      url: absoluteUrl(`/blog/${slug(post.slug)}`),
      lastModified: stamp(post.published_at),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...pages, ...courseUrls, ...categoryUrls, ...instructorUrls, ...postUrls];
}
