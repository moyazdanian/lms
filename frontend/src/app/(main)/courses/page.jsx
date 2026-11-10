import CoursesClient from "@/components/CoursesClient";
import { getCourses } from "@/lib/api/courses";

// Filter results come from the API per request.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses",
  description: "Browse all courses.",
  // Filters live in the query string; the canonical points at the clean list.
  alternates: { canonical: "/courses" },
};


export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;

  const coursesResponse = await getCourses({
    page: params.page || 1,
    per_page: 20,

    search: params.search || "",
    category: params.category || "",
    free: params.free || "",
    minPrice: params.minPrice || "",
    maxPrice: params.maxPrice || "",
    sort: params.sort || "popular",
  });

  return (
    <CoursesClient
      courses={coursesResponse.data}
      pagination={coursesResponse.meta}
      maxPrice={coursesResponse?.filters?.max_price}
    />
  );
}
