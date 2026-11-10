import LegalPageContent from "@/components/LegalPageContent";
import { getCookieConsentSafe } from "@/lib/api/legalPages";

// The admin writes this text in the panel, so it must not be baked at build.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const consent = await getCookieConsentSafe();

  return {
    title: consent?.banner_link_label || "Cookie Policy",
  };
}

export default async function CookiePolicyPage() {
  const consent = await getCookieConsentSafe();

  return (
    <div className="container mx-auto px-6 py-12">
      <LegalPageContent
        title={consent?.banner_link_label || "Cookie Policy"}
        content={consent?.banner_body}
      />
    </div>
  );
}
