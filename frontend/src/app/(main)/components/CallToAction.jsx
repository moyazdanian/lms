import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// The one colored surface on the page: a rounded panel with a faint indigo
// wash that echoes the top loader gradient, without turning decorative.
export default function CallToAction({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-neutral-900 to-neutral-900">
          <div className="flex flex-col lg:flex-row items-center gap-10 p-8 sm:p-12 lg:p-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {data?.title || "Start learning today"}
              </h2>
              <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {data?.content ||
                  "Join thousands of students already building new skills."}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <Button size="lg" asChild className="bg-white text-neutral-900 hover:bg-neutral-200">
                  <Link href="/courses">{data?.btn_text || "Browse courses"}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/25 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/instructors">{data?.btn_text_2 || "Become an instructor"}</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            {data?.image && (
              <div className="flex-1 relative w-full">
                <Image
                  src={data.image}
                  alt=""
                  width={500}
                  height={400}
                  className="rounded-2xl object-cover w-full h-auto border border-white/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
