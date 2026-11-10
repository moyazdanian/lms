import { CourseProvider } from "@/contexts/CourseContext";
import { apiUrl } from "@/lib/api/baseUrl";
import { fetchApi } from "@/lib/api/fetchApi";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    // Rendered through the root template as "LMS - <course slug>".
    title: slug,
    alternates: { canonical: `/courses/${encodeURIComponent(slug)}` },
  };
}

export default async function CourseLayout({ children, params }) {
  const { slug } = await params;

  const res = await fetchApi(apiUrl(`/api/v1/courses/${slug}`), {
    cache: "no-store",
  });

  const course = (await res.json()).data;

  return (
    <CourseProvider course={course}>
      {children}
    </CourseProvider>
  );
}