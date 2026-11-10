import request from "@/utilities/AxiosUtils";

/** GET /api/v1/wishlist?page=N */
export function getWishlist(page = 1) {
  return request({
    url: `/api/v1/wishlist?page=${page}`,
    method: "GET",
  });
}

/** POST /api/v1/wishlist */
export function addToWishlistApi(courseId) {
  return request({
    url: "/api/v1/wishlist",
    method: "POST",
    data: {
      course_id: courseId,
    },
  });
}

/** DELETE /api/v1/wishlist/{courseId} */
export function removeFromWishlistApi(courseId) {
  return request({
    url: `/api/v1/wishlist/${courseId}`,
    method: "DELETE",
  });
}

/** GET /api/v1/wishlist/ids — id-only variant for the navbar badge. */
export function getWishlistIds() {
  return request({
    url: "/api/v1/wishlist/ids",
    method: "GET",
  });
}
