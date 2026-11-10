"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// import { courses, categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Course from "@/components/Course";
import CoursesFilter from "./CoursesFilter";

export default function Courses({ courses, categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("categories")?.split(",") || [],
  );
  const [onlyFree, setOnlyFree] = useState(searchParams.get("free") === "true");
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0", 10),
    parseInt(searchParams.get("maxPrice") || "3000", 10),
  ]);
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");

  const itemsPerPage = 6;

  // 🔍 Filtering
  const filteredCourses = courses
    .filter((c) =>
      selectedCategories.length
        ? selectedCategories.includes(c.category_id)
        : true,
    )
    .filter((c) => (onlyFree ? c.price === 0 : true))
    .filter((c) => c.price >= priceRange[0] && c.price <= priceRange[1])
    .sort((a, b) => {
      if (sort === "popular") return b.enrollments_count - a.enrollments_count;
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      return 0;
    });

  // 🟣 Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (selectedCategories.length)
      params.set("categories", selectedCategories.join(","));
    if (onlyFree) params.set("free", "true");
    if (priceRange[0] !== 0) params.set("minPrice", priceRange[0]);
    if (priceRange[1] !== 3000) params.set("maxPrice", priceRange[1]);
    if (sort !== "popular") params.set("sort", sort);

    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedCategories, onlyFree, priceRange, sort, router]);

  const toggleCategory = (category) => {
    setCurrentPage(1); // برگرده به صفحه اول
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh]">
      {/* Header: Filters & Sort */}
      <div className="flex justify-between items-center mb-6 sm:hidden">
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Filters</Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-9">
            {/* <SheetHeader> */}
            <SheetTitle>Filters</SheetTitle>
            {/* </SheetHeader> */}
            <CoursesFilter
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              onlyFree={onlyFree}
              setOnlyFree={setOnlyFree}
              priceRange={priceRange}
              setPriceRange={(val) => {
                setCurrentPage(1);
                setPriceRange(val);
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(val) => {
            setCurrentPage(1);
            setSort(val);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-64">
          <div className="text-lg font-bold mb-4 flex items-center gap-2">
            <p>Filters</p>
          </div>
          <CoursesFilter
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onlyFree={onlyFree}
            setOnlyFree={setOnlyFree}
            priceRange={priceRange}
            setPriceRange={(val) => {
              setCurrentPage(1);
              setPriceRange(val);
            }}
          />
        </div>

        {/* Courses Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.length === 0 ? (
            <p className="text-center col-span-full text-gray-500">
              No courses found.
            </p>
          ) : (
            displayedCourses.map((course) => (
              <Course key={course.id} course={course} />
            )) || <p>دوره ای یافت نشد...</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href={`?page=${i + 1}`}
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
