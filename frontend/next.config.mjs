/** @type {import('next').NextConfig} */

// Remote hosts whose images (course thumbnails, admin-uploaded logo, ...) are
// rendered with next/image. Previously a hardcoded list using the deprecated
// `domains` option; now standard `remotePatterns` configured from env vars:
//
//   NEXT_PUBLIC_API_URL        — the Laravel API origin, e.g. https://api.example.com
//   (optional) NEXT_PUBLIC_MEDIA_HOSTS — extra comma-separated hosts,
//     e.g. "s3.ap-northeast-1.wasabisys.com,cdn.example.com", for buckets/CDNs
//     that serve media directly.
//
// Localhost is always allowed for development.
function parseHost(raw) {
  try {
    const url = new URL(raw);
    const pattern = {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
    };

    // next/image only matches a URL with an explicit port when the pattern
    // declares it, so keep it (the Docker stack publishes the API on :8080).
    if (url.port) pattern.port = url.port;

    return pattern;
  } catch {
    return null;
  }
}

function remotePatterns() {
  const patterns = [
    { protocol: "https", hostname: "picsum.photos" },
    { protocol: "http", hostname: "localhost" },
    { protocol: "https", hostname: "localhost" },
  ];

  const apiHost = parseHost(process.env.NEXT_PUBLIC_API_URL || "");
  if (apiHost) patterns.push(apiHost);

  (process.env.NEXT_PUBLIC_MEDIA_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .forEach((hostname) => {
      patterns.push({ protocol: "https", hostname });
      patterns.push({ protocol: "http", hostname });
    });

  return patterns;
}

const nextConfig = {
  // A self-contained server bundle for the Docker image: `node server.js`
  // from .next/standalone instead of shipping the whole node_modules tree.
  output: "standalone",
  images: {
    remotePatterns: remotePatterns(),
    // Inside a container the image optimizer cannot reach the host's
    // published ports, so the Docker build serves the original files and the
    // browser loads them straight from the API origin.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
  },
};

export default nextConfig;
