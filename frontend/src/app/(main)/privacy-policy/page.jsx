import LegalPageContent from "@/components/LegalPageContent";
import { getLegalPageSafe } from "@/lib/api/legalPages";

// The admin writes this text in the panel, so it must not be baked at build.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getLegalPageSafe("privacy");

  return {
    title: page?.privacy_title || "Privacy Policy",
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getLegalPageSafe("privacy");

  return (
    <div className="container mx-auto px-6 py-12">
      <LegalPageContent
        title={page?.privacy_title || "Privacy Policy"}
        content={page?.privacy}
      />
    </div>
  );
}
