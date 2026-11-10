import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Closing CTA panel: radial glows in the signature gradient, a gradient
 * border, and buttons that actually navigate. Content stays editable from
 * the admin panel (site_content → call).
 */
export default function CtaPanel({ data }) {
  return (
    <section className="pb-24">
      <div className="max-w-350 mx-auto px-6">
        <div className="relative overflow-hidden rounded-[28px] p-12 text-center sm:p-16 [border:1px_solid_rgba(217,70,239,0.25)] bg-neutral-900">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(600px 300px at 50% -80px, rgba(99,102,241,0.28), transparent), radial-gradient(500px 260px at 85% 120%, rgba(251,113,133,0.16), transparent)",
            }}
          />
          {/* gradient border sheen */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(217,70,239,0.7), rgba(99,102,241,0.7), transparent)",
            }}
          />

          <div className="relative">
            <h2 className="mx-auto max-w-[24ch] text-3xl font-extrabold tracking-tight leading-[1.1] text-white sm:text-4xl lg:text-[44px]">
              {data?.title || "Your next skill is one checkout away."}
            </h2>
            <p className="mx-auto mt-5 max-w-[54ch] text-base leading-relaxed text-neutral-400">
              {data?.content ||
                "Card, PayPal, Mollie or Razorpay — pay how you want, get instant access, and start your first lesson in under a minute."}
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/25 hover:opacity-90"
              >
                <Link href={data?.btn_link || "/courses"}>
                  {data?.btn_text || "Explore courses"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={data?.btn_link_2 || "/instructors"}>
                  {data?.btn_text_2 || "Become an instructor"}
                </Link>
              </Button>
            </div>

            <div className="mt-5 text-[13px] text-neutral-500">
              {data?.badge ||
                "Lifetime access · Certificates included · Secure checkout"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
