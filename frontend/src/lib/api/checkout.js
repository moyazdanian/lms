import request from "@/utilities/AxiosUtils";

/** GET /api/v1/payments — the signed-in user's payment history. */
export function getUserPayments({ page = 1, search, status, perPage, period }) {
  return request({
    url: "/api/v1/payments",
    method: "GET",
    params: { page, search, status, perPage, period },
  });
}

/**
 * POST /api/v1/payment — start a payment with the chosen gateway.
 * An idempotency key prevents double submits.
 */
export function paymentApi(gateway = "stripe") {
  const idempotencyKey =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return request({
    url: "/api/v1/payment",
    method: "POST",
    data: {
      method: gateway,
      idempotency_key: idempotencyKey,
    },
  });
}

/** GET /api/v1/payment-methods — gateways enabled in the admin panel. */
export function getPaymentMethods() {
  return request({
    url: "/api/v1/payment-methods",
    method: "GET",
  });
}

/**
 * GET /api/v1/payment/verify — gateway-agnostic.
 * Redirect gateways: session_id (or payment_id for PayPal/Mollie).
 * Razorpay modal: razorpay_order_id + razorpay_payment_id + razorpay_signature.
 * Accepts a legacy plain session_id string too.
 */
export function verifyPaymentApi(paramsOrSessionId) {
  const params =
    typeof paramsOrSessionId === "string"
      ? { session_id: paramsOrSessionId }
      : paramsOrSessionId;

  return request({
    url: "/api/v1/payment/verify",
    method: "GET",
    params,
  });
}

/** GET /api/v1/get-orders */
export function getUserOrders() {
  return request({
    url: "/api/v1/get-orders",
    method: "GET",
  });
}
