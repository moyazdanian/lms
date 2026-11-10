import Image from "next/image";
import Link from "next/link";

/**
 * Brand icons keyed by FooterSocialLink::platforms() on the backend. The
 * admin picks the platform key; this map decides which icon renders.
 */
const SOCIAL_ICONS = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2C4 2 2 4 2 7v10c0 3 2 5 5 5h10c3 0 5-2 5-5V7c0-3-2-5-5-5H7zm0 2h10c1.6 0 3 1.4 3 3v10c0 1.6-1.4 3-3 3H7c-1.6 0-3-1.4-3-3V7c0-1.6 1.4-3 3-3zm5 2a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-1a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.2 3H20l-6.6 7.5L21 21h-5.9l-4.6-6-5.3 6H2.4l7-8L3 3h6l4.2 5.5L17.2 3zm-1 16h1.7L7.7 4.7H5.9L16.2 19z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.9 8.6H3.6V21h3.3V8.6zM5.2 3a2 2 0 100 4 2 2 0 000-4zM21 13.6c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V8.6h-3.3V21h3.3v-6.7c0-1.5.7-2.4 2-2.4s1.8.9 1.8 2.4V21H21v-7.4z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  ),
  telegram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.9 4.6c.3-1.1-.8-2-1.9-1.6L2.7 9.7c-1.2.5-1.1 2.2.1 2.5l4.6 1.4 1.7 5.5c.3 1.1 1.7 1.4 2.5.6l2.4-2.4 4.5 3.3c1 .7 2.3.2 2.6-1L21.9 4.6zM8.7 13l9.3-5.7c.3-.2.6.2.4.4l-7.4 7-.3 3-2-4.7z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0012 2z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v3c-1.5 0-2.8-.4-3.9-1.2v5.9c0 3.7-2.6 5.7-5.5 5.7-2.8 0-5.1-2.1-5.1-5 0-3.2 2.9-5.4 6-4.9v3c-1.5-.5-3 .5-3 2 0 1.2 1 2.1 2.2 2.1 1.4 0 2.4-1 2.4-2.8V3h3z" />
    </svg>
  ),
};

/** Internal paths open in-app, external URLs in a new tab. */
function FooterLink({ href, children }) {
  const isExternal = /^https?:\/\//i.test(href || "");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href || "#"} className="hover:text-blue-500">
      {children}
    </Link>
  );
}

export default function Footer({ settings, footer }) {
  // Everything comes from the standalone footers table (admin panel); the
  // fallbacks below only guard against a failed API call or an empty DB.
  const about =
    footer?.about ||
    "is your gateway to explore knowledge, learn from experts, and build your future.";
  const copyright =
    footer?.copyright || "All rights reserved.";
  const quickLinks = (footer?.links || []).filter(
    (link) => link?.label && link?.url,
  );
  const socialLinks = (footer?.social_links || []).filter(
    (link) => link?.platform && link?.url,
  );

  return (
    <footer className="bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-2">
            {settings?.logo ? (
              <Image src={settings.logo} width={32} height={32} alt={settings?.site_name || "Logo"} />
            ) : null}
            <span className="font-bold text-lg">{settings?.site_name}</span>
          </div>
          <p className="mt-4 text-sm">
            {settings?.site_name} {about}
          </p>
        </div>

        {/* Quick links — the admin manages the list in the panel */}
        {quickLinks.length > 0 ? (
          <div className="text-sm">
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  <FooterLink href={link.url}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Social Media — rows managed in the admin panel */}
        {socialLinks.length > 0 ? (
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const icon = SOCIAL_ICONS[link.platform];

                return (
                  <a
                    key={link.id ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                    title={link.label || link.platform}
                    className="hover:text-blue-500"
                  >
                    {icon || link.label || link.platform}
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-4 text-center text-sm">
        © {new Date().getFullYear()} {settings?.site_name}. {copyright}
      </div>
    </footer>
  );
}
