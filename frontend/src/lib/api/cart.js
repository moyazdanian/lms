import request from "@/utilities/AxiosUtils";

/** GET /api/v1/cart — returns null instead of throwing on failures. */
export async function getUserCart() {
  try {
    const res = await request({
      url: "/api/v1/cart",
      method: "GET",
    });
    return res;
  } catch {
    return null;
  }
}

/** POST /api/v1/cart */
export function addToUserCart(courseId) {
  return request({
    url: "/api/v1/cart",
    method: "POST",
    data: {
      course_id: courseId,
    },
  });
}

/** DELETE /api/v1/cart/{courseId} */
export async function removeFromUserCart(courseId) {
  const res = await request({
    url: `/api/v1/cart/${courseId}`,
    method: "DELETE",
  });

  if (res.success === false) {
    throw new Error(res.error);
  }
  return res;
}

/** DELETE /api/v1/cart */
export function clearUserCart() {
  return request({
    url: "/api/v1/cart",
    method: "DELETE",
  });
}
