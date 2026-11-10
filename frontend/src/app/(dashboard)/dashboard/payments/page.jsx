"use client";
import React, { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PurchaseHistoryTable } from "@/components/account/PurchaseHistoryTable";
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
import { usePayment } from "@/hooks/payment/usePayment";

export default function PaymentsHistoryPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    period: "all",
    page: 1,
  });
  const [selection, setSelection] = useState({ preset: "all" });
  const range = useMemo(() => resolveRange(selection), [selection]);
  const debouncedSearch = useDebouncedValue(filters.search);

  // const { data, loading, error, refetch } = useApiResource(
  //   ({ signal }) =>
  //     getPurchaseHistory(
  //       {
  //         search: debouncedSearch,
  //         status: filters.status,
  //         preset: selection,
  //         page: filters.page,
  //         perPage: 8,
  //       },
  //       { signal },
  //     ),
  //   [debouncedSearch, filters.status, filters.page, range.from, range.to],
  // );

  const { userPaymentsQuery } = usePayment({
    search: debouncedSearch,
    status: filters.status,
    period: filters.period,
    page: filters.page,
    perPage: 8,
  });

  const { data, isLoading, isFetching, error, refetch } = userPaymentsQuery;


  const loading = isLoading || isFetching;

  const isFiltered = Boolean(debouncedSearch) || filters.status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase History"
        description="Every order you have placed, with its payment status."
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
            placeholder="Search course or order ID"
            aria-label="Search purchases"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
                page: 1,
              }))
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={(status) =>
              setFilters((current) => ({ ...current, status, page: 1 }))
            }
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
            onValueChange={(period) => setFilters((current) => ({...current , period , page:1}))}
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
              setFilters((current) => ({ ...current, page: 1 }));
            }}
          /> */}
        </div>
      </div>

      <PurchaseHistoryTable
        purchases={data?.data?.data || []}
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
