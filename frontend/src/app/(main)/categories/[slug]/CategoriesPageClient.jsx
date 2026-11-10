"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Course from "@/components/Course";
import FiltersSidebar from "@/components/FiltersSidebar";
import SortDropdown from "@/components/SortDropdown";
import ResultsInfo from "@/components/ResultsInfo";
import PaginationComponent from "@/components/PaginationComponent";

export default function CategoriesPageClient({
  courses,
  categories = [],
  initialCategory,
}) {

  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [onlyFree, setOnlyFree] = useState(searchParams.get("free") === "true");
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0", 10),
    parseInt(searchParams.get("maxPrice") || "300", 10),
  ]);
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || null
  );

  const itemsPerPage = 12;

  // 🔍 Filtering logic
  const filteredCourses = courses
    .filter((c) => (onlyFree ? c.price === 0 : true))
    .filter((c) => c.price >= priceRange[0] && c.price <= priceRange[1])
    // .filter((c) => !selectedCategory || c.category_id == selectedCategory)
    .sort((a, b) => {
      if (sort === "popular")
        return (b.enrollments_count || 0) - (a.enrollments_count || 0);
      if (sort === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return 0;
    });

  // 🟣 Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (onlyFree) params.set("free", "true");
    if (priceRange[0] !== 0) params.set("minPrice", priceRange[0]);
    if (priceRange[1] !== 300) params.set("maxPrice", priceRange[1]);
    if (sort !== "popular") params.set("sort", sort);
    // if (selectedCategory) params.set("category", selectedCategory);

    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, onlyFree, priceRange, sort, router]);

  const handleSortChange = (value) => {
    setCurrentPage(1);
    setSort(value);
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    // Other resets are handled by FiltersSidebar
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {initialCategory
              ? categories.find((c) => c.slug == initialCategory)?.name +
                " Courses"
              : "All Courses"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {selectedCategory
              ? "Browse courses in this category"
              : "Explore our collection of courses"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ResultsInfo
            total={filteredCourses.length}
            showing={displayedCourses.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          <div className="hidden md:block">
            <SortDropdown value={sort} onChange={handleSortChange} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <FiltersSidebar
          onlyFree={onlyFree}
          setOnlyFree={setOnlyFree}
          priceRange={priceRange}
          setPriceRange={(val) => {
            setCurrentPage(1);
            setPriceRange(val);
          }}
          sort={sort}
          setSort={handleSortChange}
          category={selectedCategory}
          setCategory={(val) => {
            setCurrentPage(1);
            setSelectedCategory(val);
          }}
          categories={categories}
          showCategoryFilter={false} // Hide if already in a category
          showLevelFilter={false}
          showRatingFilter={false}
          maxPrice={300}
          title="Filter Courses"
          onReset={handleResetFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Sort */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <ResultsInfo
              total={filteredCourses.length}
              showing={displayedCourses.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              compact={true}
            />
            <SortDropdown
              value={sort}
              onChange={handleSortChange}
              className="w-[140px]"
            />
          </div>

          {/* Courses Grid */}
          {displayedCourses.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedCourses.map((course) => (
                  <Course key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-12"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onReset }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No courses found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        We couldn't find any courses matching your filters. Try adjusting your
        search criteria.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );
}
