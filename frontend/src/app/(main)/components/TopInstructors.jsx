import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { apiUrl } from "@/lib/api/baseUrl";
import { fetchApi } from "@/lib/api/fetchApi";
import { avatarSrc } from "@/lib/avatar";

/**
 * Marketplace section: the people, not just the courses. Data comes from
 * GET /api/v1/instructors (name, avatar, courses_count, total_students,
 * instructor.expertise). Cards link to each instructor profile.
 */
export default async function TopInstructors({ data }) {
  const response = await fetchApi(apiUrl("/api/v1/instructors"));
  const allInstructors = await response.json();
  const instructors = (allInstructors || []).slice(0, 4);

  if (instructors.length === 0) return null;

  return (
    <section className="pb-20">
      <div className="max-w-350 mx-auto px-6">
        <SectionHeader
          title={data?.title || "Learn from people who do the work"}
          content={
            data?.content ||
            "Every instructor is vetted for real-world experience. They earn on every sale — so the best teachers keep teaching here."
          }
          viewAllHref="/instructors"
          viewAllLabel={data?.badge || "Meet all instructors"}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {instructors.map((instructor) => (
            <Link
              key={instructor.id}
              href={`/instructors/${instructor.id}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 text-center transition-all hover:-translate-y-1 hover:border-white/20"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_80px_at_50%_0%,rgba(99,102,241,0.16),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />

              <div
                className="mx-auto grid h-[76px] w-[76px] place-items-center rounded-full p-[2px]"
                style={{
                  background: "linear-gradient(135deg,#fb7185,#d946ef,#6366f1)",
                }}
              >
                <Image
                  src={avatarSrc(instructor.avatar)}
                  alt={instructor.name}
                  width={72}
                  height={72}
                  quality={75}
                  className="h-[72px] w-[72px] rounded-full bg-neutral-900 object-cover"
                />
              </div>

              <div className="mt-4 text-[15.5px] font-semibold">
                {instructor.name}
              </div>
              <div className="mt-1 text-[12.5px] text-neutral-500">
                {instructor.instructor?.expertise || "Instructor"}
              </div>

              <div className="mt-4 flex justify-center gap-5 text-[12px] text-neutral-400">
                <span>
                  <b className="block text-[14px] font-bold text-white">
                    {instructor.courses_count || 0}
                  </b>
                  courses
                </span>
                <span>
                  <b className="block text-[14px] font-bold text-white">
                    {instructor.total_students || 0}
                  </b>
                  students
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
