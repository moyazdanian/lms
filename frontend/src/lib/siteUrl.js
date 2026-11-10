// Absolute origin of the storefront. It is its own variable because the API
// usually lives on another host (api.example.com), and a sitemap or a canonical
// link pointing at the API would be wrong.
//
// Set NEXT_PUBLIC_SITE_URL to the address visitors use, e.g.
// https://www.example.com. The Docker stack passes WEB_DOMAIN. Without it the
// local dev server is assumed.
//
// A bare host ("example.com") is accepted: metadataBase needs a scheme, and a
// bad value here must not crash every page's metadata.
function normalize(raw) {
  const value = (raw || "").trim().replace(/\/+$/, "");

  if (!value) return "http://localhost:3000";

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export const siteUrl = normalize(process.env.NEXT_PUBLIC_SITE_URL);

/** Absolute URL for a storefront path ("/blog" -> "https://site/blog"). */
export function absoluteUrl(path = "/") {
  const suffix = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${suffix}`;
}
