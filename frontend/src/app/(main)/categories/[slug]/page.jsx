import { getAllCategories, getCoursesByCategory } from "@/lib/api/courses";
import CategoriesPageClient from "./CategoriesPageClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    // Rendered through the root template as "LMS - <category slug>".
    title: slug,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const courses = await getCoursesByCategory(slug);
  const categories = await getAllCategories();

  return (
    <CategoriesPageClient
      courses={courses.data}
      categories={categories}
      initialCategory={slug}
    />
  );
}
