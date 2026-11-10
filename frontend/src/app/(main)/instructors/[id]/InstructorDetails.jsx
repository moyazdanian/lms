"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { teachers } from "@/lib/data";
import { courses } from "@/lib/data";
import { avatarSrc } from "@/lib/avatar";
import Course from "@/components/Course";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InstructorProfile({ instructor }) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");

  const itemsPerPage = 2;

  if (!instructor) return <p className="p-6">Instructor not found</p>;

  const instructorCourses = instructor?.courses;

  const sortedCourses = instructorCourses.sort((a, b) => {
    if (sort === "popular") return b.students - a.students;
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
  });

  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);

    if (sort !== "popular") params.set("sort", sort);

    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, sort]);


  return (
    <div className="py-6 px-8 mx-auto min-h-[80vh]">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="text-2xl">
          <AvatarImage
            src={avatarSrc(instructor.avatar)}
            alt={instructor?.name}
          />
          <AvatarFallback>{instructor?.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{instructor?.name}</h1>
          <p className="text-gray-600">{instructor?.instructor?.expertise}</p>
          <p className="mt-2 text-sm text-gray-500">
            {instructor?.instructor?.bio}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between mt-4">
        <h2 className="text-xl font-semibold mb-8">
          Courses by {instructor.name}
        </h2>
        <Select
          className="mb-8"
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
            <SelectItem value="popular">popular</SelectItem>
            <SelectItem value="price-low">price low to high</SelectItem>
            <SelectItem value="price-high">price high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedCourses.length < 1 ? (
          <p className="text-center col-span-full">No courses found.</p>
        ) : null}
        {paginatedCourses.map((course) => (
          <Course key={course.id} course={course} />
        ))}
      </div>
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
                  isActive={currentPage > 1}
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
                  isActive={currentPage < totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
