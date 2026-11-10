"use client";

import { useState } from "react";
import { BarChart3, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InstructorSalesChart from "@/components/dashboard/instructor/InstructorSalesChart";
import { useInstructorEarnings } from "@/hooks/instructor/useInstructorMarketplace";

const periods = [
  { value: "week", label: "Last week" },
  { value: "month", label: "Last month" },
  { value: "3months", label: "Last 3 months" },
  { value: "6months", label: "Last 6 months" },
  { value: "year", label: "Last year" },
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

function Metric({ label, value, Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function InstructorDashboardOverview() {
  const [period, setPeriod] = useState("week");
  const query = useInstructorEarnings(1, period);
  const summary = query.data?.summary || {};
  const earnings = query.data?.data || [];
  const chart = query.data?.sales_chart || [];
  const totalSales = earnings.length;
  const average = totalSales ? Number(summary.paid || 0) / totalSales : 0;

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError)
    return (
      <div className="py-12 text-center text-red-600">
        Unable to load instructor dashboard.
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Instructor dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your sales, earnings and payouts.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total earnings"
          value={money(summary.paid)}
          Icon={DollarSign}
        />
        <Metric
          label="Available balance"
          value={money(summary.available)}
          Icon={WalletIcon}
        />
        <Metric label="Sales recorded" value={totalSales} Icon={ShoppingBag} />
        <Metric label="Average sale" value={money(average)} Icon={Users} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Instructor sales</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {query.isFetching ? (
            <SalesChartSkeleton />
          ) : chart.length ? (
            <InstructorSalesChart data={chart} />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No sales recorded in this period.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Order</th>
                    <th className="py-2">Gross</th>
                    <th className="py-2">Commission</th>
                    <th className="py-2">Net</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">#{item.order_id}</td>
                      <td>{money(item.gross_amount)}</td>
                      <td>{money(item.commission_amount)}</td>
                      <td>{money(item.net_amount)}</td>
                      <td className="capitalize">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available</span>
              <strong>{money(summary.available)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending payouts</span>
              <strong>{money(summary.requested)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid out</span>
              <strong>{money(summary.paid)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WalletIcon(props) {
  return <BarChart3 {...props} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-36" />
                </div>
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-40" />
        </CardHeader>
        <CardContent>
          <SalesChartSkeleton />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="flex justify-between" key={index}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SalesChartSkeleton() {
  return (
    <div className="h-64 w-full space-y-4 pt-4">
      <div className="flex h-52 items-end gap-3 border-b border-l p-4">
        <Skeleton className="h-1/3 flex-1" />
        <Skeleton className="h-1/2 flex-1" />
        <Skeleton className="h-2/3 flex-1" />
        <Skeleton className="h-1/2 flex-1" />
        <Skeleton className="h-3/4 flex-1" />
        <Skeleton className="h-1/2 flex-1" />
      </div>
    </div>
  );
}
