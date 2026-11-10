import Course from "@/components/Course";
import SectionHeader from "./SectionHeader";

export default async function PopularCourses({ data, courses }) {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          title={data?.title || "Popular courses"}
          content={data?.content}
          viewAllHref="/courses"
        />

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {courses.map((course) => (
            <Course key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
