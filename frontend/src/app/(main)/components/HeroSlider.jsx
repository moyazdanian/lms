"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSlider({ data, categories = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/courses?search=${encodeURIComponent(term)}` : "/courses");
  }

  // The hero is the one expressive moment on the page: oversized type, a
  // search that actually searches, and a quiet image panel behind.
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-900 to-neutral-950" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white max-w-2xl leading-[1.05]">
          {data?.title || "Learn what moves your career forward"}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
          {data?.content ||
            "Practical courses from working professionals. Watch anywhere, learn at your pace, keep access for life."}
        </p>

        {/* Search that actually searches the catalog */}
        <form onSubmit={submitSearch} className="mt-8 max-w-xl" role="search">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-2 backdrop-blur-sm focus-within:border-white/30 transition-colors">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn?"
              aria-label="Search courses"
              className="flex-1 bg-transparent px-3 text-white placeholder:text-neutral-500 outline-none min-w-0"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Search
            </button>
          </div>
        </form>

        {/* Real category shortcuts, straight from the API */}
        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-neutral-300 hover:border-white/40 hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Image panel: right side on desktop, behind content on mobile */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[42%]">
        <Image
          src={data?.image || "https://picsum.photos/1000/600"}
          alt=""
          fill
          priority
          className="object-cover [mask-image:linear-gradient(to_right,transparent,black_45%)]"
        />
      </div>
      <div className="lg:hidden absolute inset-0 -z-10">
        <Image
          src={data?.image || "https://picsum.photos/800"}
          alt=""
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>
    </section>
  );
}
