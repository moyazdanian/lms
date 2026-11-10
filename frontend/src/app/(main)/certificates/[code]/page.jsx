import { AwardIcon, ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import Link from "next/link";
import { verifyCertificate } from "@/lib/api/quiz";

async function fetchCertificate(code) {
  try {
    return await verifyCertificate(code, { timeout: 10000 });
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export const metadata = {
  title: "Certificate Verification",
  robots: { index: false },
};

export default async function CertificateVerificationPage({ params }) {
  const { code } = await params;
  const payload = await fetchCertificate(code);
  const certificate = payload?.certificate || null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-5">
      <div className="w-full max-w-xl">
        {!certificate ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldXIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-semibold">
              Certificate not found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No certificate exists for this link. Check the code and try again,
              or ask the holder to share the exact verification URL.
            </p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-2xl border-2 ${
              certificate.status === "valid"
                ? "border-success/40"
                : "border-destructive/40"
            }`}
          >
            {/* Header band */}
            <div className="bg-primary px-8 py-6 text-center text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {certificate.site_name || "Certificate Verification"}
              </p>
              <h1 className="mt-1 text-2xl font-bold">
                Certificate of Completion
              </h1>
            </div>

            <div className="space-y-6 bg-card px-8 py-8 text-center">
              {/* Status banner */}
              {certificate.status === "valid" ? (
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
                  <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                  Valid certificate
                </div>
              ) : (
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-semibold text-destructive">
                  <ShieldXIcon className="h-4 w-4" aria-hidden="true" />
                  Revoked certificate
                </div>
              )}

              {certificate.status === "valid" ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      This certifies that
                    </p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {certificate.student_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      successfully completed the course
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {certificate.course_title || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
                    {certificate.instructor_name ? (
                      <div>
                        <p className="text-muted-foreground">Instructor</p>
                        <p className="font-medium">
                          {certificate.instructor_name}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-muted-foreground">Issued on</p>
                      <p className="font-medium">
                        {formatDate(certificate.issued_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serial number</p>
                      <p className="font-mono font-medium">
                        {certificate.serial}
                      </p>
                    </div>
                    {certificate.revoked_at ? (
                      <div>
                        <p className="text-muted-foreground">Revoked on</p>
                        <p className="font-medium">
                          {formatDate(certificate.revoked_at)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    This certificate was revoked by the site administrator on{" "}
                    {formatDate(certificate.revoked_at)} and is no longer valid.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
                <AwardIcon className="h-4 w-4" aria-hidden="true" />
                Authenticity of this certificate can be verified using the
                serial number above.
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
