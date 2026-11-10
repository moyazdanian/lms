import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";

/**
 * Asymmetric bento grid for the popular courses — replaces two identical
 * card rows with one composed layout: 7/5 then 5/7. Same Course data shape
 * from CoursesResource, no backend changes.
 */
export default function FeaturedBento({ data, courses }) {
  if (!courses?.length) return null;

  const [first, second, third, fourth] = courses;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          title={data?.title || "What students are taking this week"}
          content={data?.content}
          viewAllHref="/courses"
          viewAllLabel={data?.badge || "Browse all courses"}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {[first, second, third, fourth].filter(Boolean).map((course, i) => {
            const spans = [
              "lg:col-span-7",
              "lg:col-span-5",
              "lg:col-span-5",
              "lg:col-span-7",
            ];
            const hasDiscount =
              course.discount_price && course.discount_price < course.price;
            const discountPct = hasDiscount
              ? Math.round(
                  ((course.price - course.discount_price) / course.price) * 100,
                )
              : 0;

            return (
              <article
                key={course.id}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 transition-colors hover:border-white/20 ${spans[i]}`}
              >
                <div className="relative aspect-[16/8] overflow-hidden">
                  <Image
                    src={course.thumbnail || "https://picsum.photos/1000/560"}
                    alt={course.title}
                    fill
                    quality={75}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {discountPct > 0 && (
                    <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-2.5 py-1 text-[11.5px] font-bold text-white">
                      −{discountPct}%
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <span className="text-[11.5px] font-semibold tracking-wide text-fuchsia-400">
                    {course.category_id?.name?.toUpperCase?.() ||
                      course.category_id?.name}
                  </span>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-[12.5px] text-neutral-500">
                    <span className="text-amber-400">
                      ★{" "}
                      {(course.rating || 0).toFixed?.(1) ||
                        course.rating ||
                        "—"}
                    </span>
                    <span>{course.enrollments_count || 0} students</span>
                    {course.level && <span>{course.level}</span>}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2.5">
                      {course.instructor?.avatar && (
                        <Image
                          src={course.instructor.avatar}
                          alt=""
                          quality={50}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-[13px] text-neutral-400">
                        {course.instructor?.name}
                      </span>
                    </div>
                    <span className="text-[15px] font-bold">
                      {hasDiscount ? (
                        <>
                          <span className="text-rose-400">
                            ${course.discount_price}
                          </span>
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
