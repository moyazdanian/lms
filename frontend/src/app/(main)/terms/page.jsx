import LegalPageContent from "@/components/LegalPageContent";
import { getLegalPageSafe } from "@/lib/api/legalPages";

// The admin writes this text in the panel, so it must not be baked at build.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getLegalPageSafe("terms");

  return {
    title: page?.terms_title || "Terms of Service",
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const page = await getLegalPageSafe("terms");

  return (
    <div className="container mx-auto px-6 py-12">
      <LegalPageContent
        title={page?.terms_title || "Terms of Service"}
        content={page?.terms}
      />
    </div>
  );
}
