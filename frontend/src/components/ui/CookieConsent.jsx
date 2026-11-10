"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

/**
 * Cookie-consent banner. All copy comes from the admin panel
 * ("Content > Cookie Consent") through the layout's server component
 * (see src/app/(main)/layout.js). The defaults below only guard against a
 * failed API call or an empty DB so the banner still works on a fresh install.
 */
export function CookieConsent({ consent = {} }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem("cookie_consent");
    if (!stored) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
      }),
    );
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      }),
    );
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const title = consent?.banner_title || "We value your privacy";
  const body = consent?.banner_body_plain ||
    "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.";
  const acceptLabel = consent?.banner_accept_label || "Accept All";
  const necessaryLabel = consent?.banner_necessary_label || "Necessary Only";
  const policyLabel = consent?.banner_link_label || "Cookie Policy";

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 md:w-[80%] w-full z-50 animate-slide-up"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {body}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={acceptAll}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {acceptLabel}
              </button>
              <button
                onClick={acceptNecessary}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {necessaryLabel}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {" "}
              <Link href="/privacy-policy" className="underline hover:text-amber-500">
                Privacy Policy
              </Link>
              {" | "}
              <Link href="/terms" className="underline hover:text-amber-500">
                Terms of Service
              </Link>
              {" | "}
              <Link href="/cookie-policy" className="underline hover:text-amber-500">
                {policyLabel}
              </Link>
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
