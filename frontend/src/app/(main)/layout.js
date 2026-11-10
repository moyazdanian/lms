import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import Providers from "../Providers";
import { icons } from "lucide-react";
import NextTopLoader from "nextjs-toploader";
import { getSettingsSafe } from "@/lib/api/settings";
import { getFooter } from "@/lib/api/footer";
import { getCookieConsentSafe } from "@/lib/api/legalPages";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CookieConsent } from "@/components/ui/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
//   title: {
//     template: "%s LMS",
//     default: "LMS"
//   },
//   icons: {
//     icon: "/icon.png",
//   },
// }

export async function generateMetadata() {
  const settings = await getSettingsSafe();
  const siteName = settings?.settings?.site_name || "LMS";

  return {
    // "Page - Site name" — child pages only set the page name and the
    // template appends the brand: "Create Course - LMS".
    title: {
      template: `${siteName} - %s`,
      default: siteName,
    },
    // Only emitted when the admin uploaded a favicon; otherwise the
    // browser default / app/icon fallback applies.
    ...(settings?.settings?.faveicon
      ? { icons: { icon: settings.settings.faveicon } }
      : {}),
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettingsSafe();
  // The footer is its own standalone config (footers table, /api/v1/footer)
  // managed from the admin "Footer" page; the component falls back to
  // defaults when the API is unreachable.
  const footerData = await getFooter();
  // Cookie-banner copy is admin-written ("Content > Cookie Consent" in the
  // panel); the component itself only renders when no consent is stored.
  const cookieConsent = await getCookieConsentSafe();
  const footerVisible = footerData?.is_active !== false;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-neutral-800`}
      >
        <NextTopLoader color="linear-gradient(to right, rgb(251, 113, 133), rgb(217, 70, 239), rgb(99, 102, 241))" speed={800} showSpinner={false} crawlSpeed={800} height={5} />
        <Providers>
         <ThemeProvider
           attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
           disableTransitionOnChange
         >
              <Navbar
                settings={settings?.settings}
                categories={settings?.categories ?? []}
              />
              <Breadcrumbs />
              {children}
              {footerVisible && (
                <Footer settings={settings?.settings} footer={footerData} />
              )}
              <CookieConsent consent={cookieConsent} />
          </ThemeProvider>
        </Providers>
        <Toaster position="top-center" closeButton="true" richColors />
      </body>
    </html>
  );
}
