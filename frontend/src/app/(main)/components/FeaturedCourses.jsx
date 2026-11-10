"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Course from "@/components/Course";
import SectionHeader from "./SectionHeader";

export default function FeaturedCourses({ data, courses }) {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          title={data?.title || "Featured courses"}
          content={data?.content}
          viewAllHref="/courses"
        />

        <Carousel
          opts={{
            align: "start",
          }}
          className="relative mx-auto"
        >
          <CarouselContent className="-ml-4">
            {courses?.map((course, index) => (
              <CarouselItem
                key={index}
                className="pl-4 basis-[85%] sm:basis-[45%] md:basis-[30%]"
              >
                <Course course={course} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </section>
  );
}
