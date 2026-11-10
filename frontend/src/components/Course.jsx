import Image from "next/image";
import Link from "next/link";
import {
  AddToCartButton,
  FreeEnrollButton,
  WishlistButton,
} from "./CourseClient";
import { HiMiniAcademicCap } from "react-icons/hi2";
import { Badge } from "./ui/badge";
import ShowPrice from "./ui/ShowPrice";

/**
 * Modern course card matching the redesigned homepage: quiet dark panel,
 * hairline border, gradient discount pill (the site's signature
 * rose→fuchsia gradient), instructor row and a compact add-to-cart.
 * Same data shape (CoursesResource) and the same client buttons as before —
 * only the presentation changed.
 */
export default function Course({ course }) {
  const hasDiscount =
    course?.discount_price &&
    Number(course.discount_price) < Number(course.price);
  const discountPercentage = hasDiscount
    ? Math.round(((course.price - course.discount_price) / course.price) * 100)
    : 0;
  // Effective price mirrors the backend rule: a set sale price that is
  // lower than the list price wins; zero means the course is free.
  const effectivePrice =
    hasDiscount ||
    (course?.discount_price !== null &&
      course?.discount_price !== undefined &&
      Number(course.discount_price) >= 0 &&
      Number(course.discount_price) < Number(course.price))
      ? Number(course.discount_price)
      : Number(course.price);
  const isFree = effectivePrice <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-white/25">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          quality={75}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 85vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {/* soft bottom shade so overlaid badges stay readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Gradient discount pill — the site's signature gradient */}
        {hasDiscount && !isFree && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-fuchsia-500/25">
            −{discountPercentage}%
          </span>
        )}

        {/* Free badge */}
        {isFree && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/25">
            Free
          </span>
        )}

        {/* Wishlist */}
        <div className="absolute right-3 top-3 z-10 opacity-90 transition-opacity group-hover:opacity-100">
          <WishlistButton course={course} />
        </div>

        {/* Category chip */}
        <Link
          href={`/categories/${course.category_id.slug}`}
          className="absolute bottom-3 left-3 z-10 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur transition-colors hover:border-white/35"
        >
          {course.category_id.name || "Uncategorized"}
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-[2.75rem] text-[15.5px] font-semibold leading-snug tracking-tight text-white line-clamp-2">
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>

        {/* Instructor */}
        <div className="mt-2.5 flex items-center gap-2">
          {course.instructor?.avatar && (
            <Image
              src={course.instructor.avatar}
              alt=""
              width={22}
              height={22}
              quality={50}
              className="h-[22px] w-[22px] rounded-full object-cover"
            />
          )}
          <span className="truncate text-[12.5px] text-neutral-400">
            {course.instructor?.name}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-neutral-500">
          <span className="text-amber-400">
            ★ {(course.rating || 0).toFixed?.(1) || course.rating || "New"}
          </span>
          <span className="flex items-center gap-1">
            <HiMiniAcademicCap className="h-3.5 w-3.5" />
            {course.enrollments_count || 0}
          </span>
          {course.level && <span>{course.level}</span>}
          {course.status &&
            (() => {
              const normalizedStatus = String(course.status).toLowerCase();
              const statusText =
                normalizedStatus === "ongoing"
                  ? "Going on"
                  : normalizedStatus === "completed"
                    ? "Finished"
                    : String(course.status).replace(/_/g, " ");
              const statusHint =
                normalizedStatus === "ongoing"
                  ? "This course is going on"
                  : normalizedStatus === "completed"
                    ? "This course is finished"
                    : String(course.status).replace(/_/g, " ");

              const badgeVariant =
                normalizedStatus === "ongoing"
                  ? "default"
                  : normalizedStatus === "completed"
                    ? "secondary"
                    : "outline";

              return (
                <Badge
                  variant={badgeVariant}
                  title={statusHint}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-300"
                >
                  {statusText}
                </Badge>
              );
            })()}
        </div>

        {/* Price + action */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-3.5">
          <div className="leading-tight">
            <ShowPrice
              price={course.price}
              discount_price={course.discount_price}
            />
          </div>
          <div className="w-[96px] shrink-0">
            {isFree ? (
              <FreeEnrollButton course={course} />
            ) : (
              <AddToCartButton course={course} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
