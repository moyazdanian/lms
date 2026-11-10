import request from "@/utilities/AxiosUtils";

/** POST /api/v1/coupon-apply */
export function couponApply(code) {
  return request({
    url: "/api/v1/coupon-apply",
    method: "POST",
    data: { code },
  });
}

/** DELETE /api/v1/coupon */
export function removeCoupon() {
  return request({
    url: "/api/v1/coupon",
    method: "DELETE",
  });
}

/** GET /api/v1/coupon */
export function getAppliedCoupon() {
  return request({
    url: "/api/v1/coupon",
    method: "GET",
  });
}
