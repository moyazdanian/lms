"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Course from "@/components/Course";
import SectionHeader from "./SectionHeader";

/**
 * Latest courses with underline category tabs. Header texts come from the
 * admin panel (site_contents → latest_courses). Autoplay/loop removed —
 * motion now only answers a user action (tab click, carousel arrows).
 */
export default function LatestCoursesSection({ data, courses, categories }) {
  const [activeCategory, setActiveCategory] = React.useState(
    categories[0]?.name,
  );

  const coursesByCategory = courses.filter(
    (course) =>
      course.category_id.parent === activeCategory ||
      course.category_id.name === activeCategory,
  );

  return (
    <section className="py-20">
      <div className="max-w-350 mx-auto px-6">
        <SectionHeader
          title={data?.title || "Latest courses"}
          content={data?.content}
          viewAllHref="/courses"
          viewAllLabel={data?.badge}
        />

        {/* Underline category tabs */}
        <div className="mb-8 flex flex-wrap gap-1 border-b border-white/10">
          {categories.map((cat) => {
            const active = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                aria-pressed={active}
                className={`-mb-px rounded-t-sm border-b-2 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-white font-medium text-white"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {coursesByCategory.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="relative mx-auto">
            <CarouselContent className="-ml-4">
              {coursesByCategory.map((course, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-[85%] sm:basis-[45%] md:basis-[30%]"
                >
                  <Course course={course} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-4 top-1/2 z-10 -translate-y-1/2" />
            <CarouselNext className="absolute -right-4 top-1/2 z-10 -translate-y-1/2" />
          </Carousel>
        ) : (
          <p className="py-10 text-sm text-neutral-400">
            No courses in this category yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
