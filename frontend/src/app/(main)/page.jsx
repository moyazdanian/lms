import Hero from "./components/Hero";
import FeaturesStrip from "./components/FeaturesStrip";
import FeaturedBento from "./components/FeaturedBento";
import TopInstructors from "./components/TopInstructors";
import LatestCoursesSection from "./components/LatestCourses";
import BlogSection from "./components/BlogSection";
import CtaPanel from "./components/CtaPanel";

import { getSiteContent, getHeroCourses } from "@/lib/api/home";
import { getLatestBlogPosts } from "@/lib/api/blog";
import { getCategories } from "@/lib/api/courses";
import { apiUrl } from "@/lib/api/baseUrl";

// Rendered per request: the whole page is built from live API data, and a
// container image must be buildable while no API is running yet.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online Courses",
  description: "Learn new skills with expert-led video courses.",
};

export default async function Home() {
  const settingDataUrl = apiUrl("/api/v1/settingsData");

const [siteContentData, settingResponse, categories, latestPosts] =
  await Promise.all([
    getSiteContent(),
    fetch(settingDataUrl, {
      next: {
        revalidate: 60,
        tags: ["home-settings"],
      },
    }),
    getCategories(),
    getLatestBlogPosts(3),
  ]);

if (!settingResponse.ok) {
  throw new Error("Failed to fetch home settings");
}

const settingData = await settingResponse.json();

  const section = (key) => siteContentData.find((item) => item.section === key);

  const heroData = section("hero");
  const featuresData = section("features_strip");
  const popularData = section("popular");
  const latestCoursesData = section("latest_courses");
  const instructorsData = section("instructors");
  const blogData = section("blog");
  const callToActionData = section("call");

  const adminHeroCourses = getHeroCourses(siteContentData);

  const showcaseCourses =
    adminHeroCourses.length === 2
      ? adminHeroCourses
      : [...adminHeroCourses, ...(settingData?.popular_courses || [])].slice(
          0,
          2,
        );

  return (
    <div>
      {heroData?.visible !== false && (
        <Hero
          heroData={heroData}
          categories={categories}
          courses={showcaseCourses}
        />
      )}

      {featuresData?.visible !== false && (
        <FeaturesStrip features={featuresData?.features || []} />
      )}

      {popularData?.visible !== false &&
        settingData?.popular_courses?.length > 0 && (
          <FeaturedBento
            data={popularData}
            courses={settingData.popular_courses}
          />
        )}

      {latestCoursesData?.visible !== false &&
        settingData?.latest_courses?.length > 0 && (
          <LatestCoursesSection
            data={latestCoursesData}
            courses={settingData.latest_courses}
            categories={categories}
          />
        )}

      {instructorsData?.visible !== false && (
        <TopInstructors data={instructorsData} />
      )}

      {blogData?.visible !== false && (
        <BlogSection data={blogData} posts={latestPosts} />
      )}

      {callToActionData?.visible !== false && (
        <CtaPanel data={callToActionData} />
      )}
    </div>
  );
}
