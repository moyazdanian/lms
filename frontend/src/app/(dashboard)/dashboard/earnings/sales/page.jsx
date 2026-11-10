"use client";
import React, { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SalesTable } from "@/components/payments/SalesTable";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/dashboard/useDebouncedValue";
import { getStatusOptions } from "@/lib/status";
import { resolveRange } from "@/lib/dateRanges";
import {
  useInstructorCourseOptions,
  useInstructorSales,
} from "@/hooks/instructor/useInstructorMarketplace";

export default function SalesPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    courseId: "all",
    period: "all",
    page: 1,
  });
  const [selection, setSelection] = useState({ preset: "3m" });
  const range = useMemo(() => resolveRange(selection), [selection]);
  const debouncedSearch = useDebouncedValue(filters.search);

  const { data: courseOptions } = useInstructorCourseOptions();

  const { data, isPending, isFetching, error, refetch } = useInstructorSales({
    search: debouncedSearch,
    status: filters.status,
    courseId: filters.courseId,
    perPage: 10,
    period: filters.period,
  });

  const loading = isPending || isFetching;

  const isFiltered =
    Boolean(debouncedSearch) ||
    filters.status !== "all" ||
    filters.courseId !== "all" ||
    filters.period !== "all";

  function update(patch) {
    setFilters((current) => ({ ...current, page: 1, ...patch }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Every order for your courses, with the platform fee and your share."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            type="search"
            className="pl-9"
            placeholder="Search student, course or order ID"
            aria-label="Search sales"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.courseId}
            onValueChange={(courseId) => update({ courseId })}
          >
            <SelectTrigger className="w-[200px]" aria-label="Filter by course">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {(courseOptions || []).map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(status) => update({ status })}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getStatusOptions("payment").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.period}
            onValueChange={(period) => update({ period })}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "3m", label: "Last 3 months" },
                { value: "6m", label: "Last 6 months" },
                { value: "12m", label: "Last 12 months" },
                { value: "all", label: "All time" },
              ].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* <DateRangeFilter
            value={range}
            onChange={(next) => {
              setSelection((current) => ({ ...current, ...next }));
              update({});
            }}
          /> */}
        </div>
      </div>

      <SalesTable
        sales={data?.data || []}
        loading={loading}
        error={error}
        onRetry={refetch}
        isFiltered={isFiltered}
      />

      <Pagination
        meta={data?.meta}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </div>
  );
}
