import request from "@/utilities/AxiosUtils";
import { apiUrl } from "./baseUrl";
import { fetchApi } from "./fetchApi";

// Public storefront catalog — SSR pages fetch these with plain fetch inside
// page/layout components; the client-safe helpers live here.

/** GET /api/v1/courses — public catalog with filters (SSR-friendly). */
export async function getCourses(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const response = await fetchApi(apiUrl(`/api/v1/courses?${query.toString()}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
}

/** GET /api/v1/categories — the tree shown in the navbar/search. */

export async function getCategories() {
  const res = await fetchApi(apiUrl("/api/v1/categories"), {
    next: {
      revalidate: 3600,
      tags: ["categories"],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}


/** GET /api/v1/allcategories — flat list, used by course filters. */
export async function getAllCategories() {
  const res = await fetchApi(apiUrl("/api/v1/allcategories"));

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

/** GET /api/v1/courses/{slug} — full course detail for SSR. */
export async function getCourse(slug) {
  const res = await fetchApi(apiUrl(`/api/v1/courses/${slug}`));

  if (!res.ok) {
    throw new Error("Failed to fetch course");
  }

  return res.json();
}

/** GET /api/v1/categories/{slug}/courses */
export async function getCoursesByCategory(categorySlug) {
  const res = await fetchApi(
    apiUrl(`/api/v1/categories/${categorySlug}/courses`)
  );

  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }

  return res.json();
}

/** GET /api/v1/instructors */
export async function getInstructors() {
  const res = await fetchApi(apiUrl("/api/v1/instructors"));

  if (!res.ok) {
    throw new Error("Failed to fetch instructors");
  }

  return res.json();
}

/** GET /api/v1/instructor/{id} */
export async function getInstructor(id) {
  const res = await fetchApi(apiUrl(`/api/v1/instructor/${id}`));

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch instructor details");
  }

  return data.data;
}

/** GET /api/v1/review/{courseId} — public reviews of a course. */
export function getReviews(courseId) {
  return request({
    url: `/api/v1/review/${courseId}`,
    method: "GET",
  });
}

/** POST /api/v1/review */
export function storeComment(courseId, comment, rating, parentId = null) {
  return request({
    url: "/api/v1/review",
    method: "POST",
    data: {
      course_id: courseId,
      comment,
      rating,
      parent_id: parentId,
    },
  });
}
