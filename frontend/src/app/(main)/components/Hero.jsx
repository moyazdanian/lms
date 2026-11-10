"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The new bold hero: aurora glows in the site's signature
 * rose→fuchsia→indigo gradient, oversized type, a search that actually
 * searches, floating course cards and an infinite category ticker.
 * All content comes from the admin panel (site_content) and the API.
 */
export default function Hero({ heroData, categories = [], courses = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const tickerRef = useRef(null);

  // Duplicate the ticker content once for the seamless CSS loop.
  useEffect(() => {
    const track = tickerRef.current;
    if (track && track.children.length > 0) {
      track.innerHTML += track.innerHTML;
    }
  }, [categories]);

  function submitSearch(e) {
    e.preventDefault();
    const term = query.trim();
    router.push(
      term ? `/courses?search=${encodeURIComponent(term)}` : "/courses",
    );
  }

  const showcase = courses.slice(0, 2);

  return (
    <>
      <header className="relative overflow-hidden">
        {/* Aurora background */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="hero-drift absolute -top-80 -left-52 h-[720px] w-[720px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="hero-drift-reverse absolute -top-40 -right-32 h-[560px] w-[560px] rounded-full bg-fuchsia-600/15 blur-3xl" />
        </div>

        <div className="relative max-w-350 mx-auto px-6 pt-20 pb-24 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:items-center">
          {/* Copy + search */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[13px] text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
              </span>
              {heroData?.badge || "New courses every week"}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tighter leading-[1.05] text-white">
              {heroData?.title || "Learn the skills that"}{" "}
              <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                {heroData?.highlight || "actually pay."}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-400">
              {heroData?.content ||
                "Practical video courses from working professionals. Buy once, own forever — with certificates, quizzes and lifetime updates built in."}
            </p>

            <form
              onSubmit={submitSearch}
              role="search"
              className="mt-8 flex items-center gap-2 max-w-xl rounded-2xl border border-white/15 bg-white/[0.04] p-2 pl-4 backdrop-blur-sm transition-colors focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_0_4px_rgba(217,70,239,0.08)]"
            >
              <svg
                className="shrink-0 text-neutral-500"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  heroData?.search_placeholder || "What do you want to learn?"
                }
                aria-label="Search courses"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-transform hover:-translate-y-px"
              >
                Search
              </button>
            </form>

            {/* Category chips from the API */}
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[13px] text-neutral-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  {cat.name}
                  {cat.courses_count ? (
                    <span className="ml-1.5 text-[11px] text-neutral-600">
                      {cat.courses_count}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

          {/* Floating course cards (desktop) */}
          <div
            className="relative mt-14 hidden h-[460px] lg:block"
            aria-hidden="true"
          >
            {showcase[0] && (
              <HeroCourseCard
                course={showcase[0]}
                tag="Bestseller"
                className="hero-float absolute left-15 top-12 w-[330px]"
              />
            )}
            {showcase[1] && (
              <HeroCourseCard
                course={showcase[1]}
                tag={showcase[1].category_id?.name || "New"}
                className="hero-float hero-float-delay-1 absolute right-15 top-0 w-[250px]"
              />
            )}
            <div className="hero-float hero-float-delay-2 absolute bottom-10 right-30 flex items-center gap-4 rounded-2xl border border-white/10 bg-neutral-900/90 px-5 py-4 shadow-2xl backdrop-blur">
              <div
                className="grid h-12 w-12 place-items-center rounded-full"
                style={{
                  background:
                    "conic-gradient(from 210deg, #fb7185, #d946ef, #6366f1, #fb7185)",
                }}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-[12px] font-extrabold">
                  92%
                </span>
              </div>
              <div>
                <div className="text-[13.5px] font-semibold">
                  Certificates that count
                </div>
                <div className="text-[12px] text-neutral-500">
                  Pass the quiz, prove the skill
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category ticker */}
      {categories.length > 0 && (
        <div
          className="overflow-hidden border-y border-white/10 bg-white/[0.015] py-3.5"
          aria-hidden="true"
        >
          <div ref={tickerRef} className="ticker-anim flex w-max gap-11">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-2.5 whitespace-nowrap text-[13.5px] text-neutral-400"
              >
                <b className="font-semibold text-white">{cat.name}</b>
                <span className="h-1 w-1 rounded-full bg-fuchsia-500/70" />
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** A small self-contained course card used inside the hero collage. */
function HeroCourseCard({ course, tag, className = "" }) {
  const hasDiscount =
    course.discount_price && course.discount_price < course.price;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur ${className}`}
    >
      <div className="relative">
        <span className="absolute left-3 top-3 z-10 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {tag}
        </span>
        <Image
          src={course.thumbnail || "https://picsum.photos/660/340"}
          alt=""
          width={660}
          height={340}
          quality={75}
          className="h-36 w-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="text-[14.5px] font-semibold leading-snug line-clamp-2">
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </div>
        <div className="mt-1.5 text-[12.5px] text-neutral-500">
          {course.instructor?.name} · {course.enrollments_count || 0} students
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] tracking-wide text-amber-400">
            ★ {(course.rating || 4.8).toFixed?.(1) || course.rating || "4.8"}
          </span>
          <span className="text-[15px] font-bold">
            {hasDiscount ? (
              <>
                <span className="text-rose-400">${course.discount_price}</span>
                <s className="ml-1.5 text-[12.5px] font-normal text-neutral-500">
                  ${course.price}
                </s>
              </>
            ) : (
              <>${course.price}</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
