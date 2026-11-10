import { getInstructor } from "@/lib/api/courses";
import InstructorProfile from "./InstructorDetails";

export async function generateMetadata({ params }) {
  const { id } = params;
  const instructor = await getInstructor(id);

  return {
    // Rendered through the root template as "LMS - <name>".
    title: instructor.name || "Instructor",
    alternates: { canonical: `/instructors/${encodeURIComponent(id)}` },
  };
}

export default async function InstructorDetails({ params }) {
  const { id } = params;

  const instructor = await getInstructor(id);

  return <InstructorProfile instructor={instructor} />;
}
