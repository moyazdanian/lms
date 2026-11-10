import { siteUrl } from "@/lib/siteUrl";

// Crawlers may read the storefront; the signed-in dashboard and the checkout
// flow are either personal or stateful and have nothing worth indexing.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/cart",
          "/checkout",
          "/payment",
          "/auth",
          "/403",
          "/api",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
