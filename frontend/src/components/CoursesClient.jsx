"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Course from "@/components/Course";
import FiltersSidebar from "@/components/FiltersSidebar";
import SortDropdown from "@/components/SortDropdown";
import ResultsInfo from "@/components/ResultsInfo";
import PaginationComponent from "@/components/PaginationComponent";
import HeroSection from "./HeroSection";

import { Separator } from "@/components/ui/separator";
import CoursesLoading from "@/app/(main)/courses/Loading";

export default function CoursesClient({
  courses = [],
  categories = [],
  pagination,
  maxPrice = 0,
}) {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
    |--------------------------------------------------------------------------
    | URL values
    |--------------------------------------------------------------------------
    */

  const currentPage = Number(searchParams.get("page") || 1);

  const urlSearch = searchParams.get("search") || "";

  const urlCategory = searchParams.get("category") || "";

  const urlFree = searchParams.get("free") === "true";

  const urlMinPrice = Number(searchParams.get("minPrice") || 0);

  const urlMaxPrice = Number(searchParams.get("maxPrice") ?? maxPrice);

  const urlSort = searchParams.get("sort") || "popular";

  /*
    |--------------------------------------------------------------------------
    | Local search state
    |--------------------------------------------------------------------------
    */

  const [search, setSearch] = useState(urlSearch);

  /*
    |--------------------------------------------------------------------------
    | Sync search input when URL changes
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /*
    |--------------------------------------------------------------------------
    | Update URL
    |--------------------------------------------------------------------------
    */

  const updateParams = (updates = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === false
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    /*
        |--------------------------------------------------------------------------
        | Every filter change goes to page 1
        |--------------------------------------------------------------------------
        */

    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  /*
    |--------------------------------------------------------------------------
    | Search debounce
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedSearch = search.trim();

      /*
            Avoid unnecessary navigation
            */

      if (normalizedSearch === urlSearch) {
        return;
      }

      updateParams({
        search: normalizedSearch,
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  /*
    |--------------------------------------------------------------------------
    | Filter handlers
    |--------------------------------------------------------------------------
    */

  const handleFreeChange = (value) => {
    updateParams({
      free: value,
    });
  };

  const handleCategoryChange = (value) => {
    updateParams({
      category: value,
    });
  };

  const handlePriceChange = (value) => {
    updateParams({
      minPrice: value[0] > 0 ? value[0] : null,

      maxPrice: value[1] < maxPrice ? value[1] : null,
    });
  };

  const handleSortChange = (value) => {
    updateParams({
      sort: value === "popular" ? null : value,
    });
  };

  /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

  const handlePageChange = (page) => {
    updateParams({
      page: page > 1 ? page : null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

  const handleResetFilters = () => {
    const params = new URLSearchParams();

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });

    setSearch("");
  };

  /*
    |--------------------------------------------------------------------------
    | Price range
    |--------------------------------------------------------------------------
    */

  const priceRange = [urlMinPrice, urlMaxPrice];

  /*
    |--------------------------------------------------------------------------
    | Pagination metadata
    |--------------------------------------------------------------------------
    */

  const totalPages = pagination?.last_page || 1;

  const total = pagination?.total || 0;

  const showing = courses.length;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh]">
      {/*add Hero later */}
      {/* <HeroSection
        title="Explore Our Extensive Course Catalog"
        subTitle="Expand Your Skills with Our Comprehensive Course Library."
        firstNumber={total}
        firstText="Courses Available"
        secondNumber={categories.length}
        secondText="Total Categories"
        thirdNumber="1000"
        thirdText="Avg. Instructor Rating"
      />

      <Separator className="mb-3" /> */}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <ResultsInfo
          total={total}
          showing={showing}
          currentPage={currentPage}
          itemsPerPage={pagination?.per_page || 20}
        />

        <div className="flex w-full md:w-auto gap-4">
          {/* Search */}

          <div className="w-full text-center md:w-80">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-75 rounded-lg border border-gray-300 bg-whitepx-4 py-2.5 px-2.5 text-sm  outline-none  transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Desktop sort */}

          <div className="hidden md:block">
            <SortDropdown value={urlSort} onChange={handleSortChange} />
          </div>
        </div>
      </div>
      {/* Main */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <div className="hidden md:block">
          <FiltersSidebar
            onlyFree={urlFree}
            setOnlyFree={handleFreeChange}
            priceRange={priceRange}
            setPriceRange={handlePriceChange}
            sort={urlSort}
            setSort={handleSortChange}
            category={urlCategory}
            setCategory={handleCategoryChange}
            categories={categories}
            showCategoryFilter={true}
            showLevelFilter={false}
            showRatingFilter={false}
            maxPrice={maxPrice}
            title="Filter Courses"
            onReset={handleResetFilters}
          />
        </div>
        {/* Courses */}

        <div className="flex-1">
          {/* Mobile sort */}

          <div className="md:hidden flex items-center justify-between mb-6">
            <SortDropdown
              value={urlSort}
              onChange={handleSortChange}
              className="w-[140px]"
            />

            <FiltersSidebar
              onlyFree={urlFree}
              setOnlyFree={handleFreeChange}
              priceRange={priceRange}
              setPriceRange={handlePriceChange}
              sort={urlSort}
              setSort={handleSortChange}
              category={urlCategory}
              setCategory={handleCategoryChange}
              categories={categories}
              showCategoryFilter={true}
              showLevelFilter={false}
              showRatingFilter={false}
              maxPrice={maxPrice}
              title="Filter Courses"
              onReset={handleResetFilters}
            />
          </div>

          <Separator className="mb-6 md:hidden" />

          {/* Course grid */}

          {isPending ? (
            <CoursesLoading />
          ) : courses.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              <div
                className="
                                grid
                                grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-4
                                gap-6
                            "
              >
                {courses.map((course) => (
                  <Course key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}

              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-12"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({ onReset }) {
  return (
    <div className="text-center py-16">
      <div
        className="
                w-20
                h-20
                mx-auto
                mb-6
                rounded-full
                bg-gray-100
                dark:bg-gray-800
                flex
                items-center
                justify-center
            "
      >
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

      <h3
        className="
                text-2xl
                font-bold
                text-gray-900
                dark:text-white
                mb-3
            "
      >
        No courses found
      </h3>

      <p
        className="
                text-gray-600
                dark:text-gray-400
                mb-8
                max-w-md
                mx-auto
            "
      >
        We couldn't find any courses matching your filters. Try adjusting your
        search criteria.
      </p>

      <button
        onClick={onReset}
        className="
                    px-6
                    py-3
                    bg-blue-600
                    text-white
                    font-medium
                    rounded-lg
                    hover:bg-blue-700
                    transition-colors
                "
      >
        Reset All Filters
      </button>
    </div>
  );
}
