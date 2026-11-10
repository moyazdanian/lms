// Two different callers reach the Laravel API, and they can need different
// addresses once the app runs in containers:
//
//   * the browser can only reach the published (public) origin;
//   * a Server Component fetches from inside the container network, where the
//     public origin may not resolve or may point at a different machine.
//
// Outside Docker only NEXT_PUBLIC_API_PROD_URL exists and both cases use it,
// so nothing changes for local development. The Docker stack sets
// API_INTERNAL_URL (e.g. http://app) for the server-side calls.
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_PROD_URL || "").replace(
  /\/+$/,
  ""
);
const INTERNAL_BASE = (process.env.API_INTERNAL_URL || PUBLIC_BASE).replace(
  /\/+$/,
  ""
);

export const publicApiBase = PUBLIC_BASE;

/** Absolute API URL for the caller's side of the fence. */
export function apiUrl(path) {
  const base = typeof window === "undefined" ? INTERNAL_BASE : PUBLIC_BASE;
  const suffix = path.startsWith("/") ? path : `/${path}`;

  return `${base}${suffix}`;
}
