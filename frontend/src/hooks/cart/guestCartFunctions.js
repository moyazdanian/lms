const KEY = "guest_cart";

export function readGuestCart() {
  if (typeof window === "undefined") return { cart: [], subtotal: 0 };
  return JSON.parse(localStorage.getItem(KEY)) || { cart: [], subtotal: 0 };
}

export function writeGuestCart(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
