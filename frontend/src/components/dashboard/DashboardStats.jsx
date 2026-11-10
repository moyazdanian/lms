import React from "react";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  UsersIcon,
  WalletIcon,
  HourglassIcon,
  BadgeDollarSign,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ErrorState } from "../common/ErrorState";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    key: "total_revenue",
    label: "Total Revenue",
    icon: DollarSignIcon,
    money: true,
    featured: true,
  },
  { key: "total_sales", label: "Total Sales", icon: ShoppingCartIcon },
  { key: "total_students", label: "Total Students", icon: UsersIcon },
  { key: "total_courses", label: "Total Courses", icon: BookOpenIcon },
  {
    key: "paid_earnings",
    label: "Paid Earnings",
    icon: BadgeDollarSign,
    money: true,
  },
  {
    key: "pending_earnings",
    label: "Pending Earnings",
    icon: HourglassIcon,
    money: true,
  },
  {
    key: "available_balance",
    label: "Available Balance",
    icon: WalletIcon,
    money: true,
  },
];

export function DashboardStats({
  stats,
  loading,
  error,
  onRetry,
  comparisonLabel,
}) {
  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => (
        <StatCard
          key={card.key}
          card={card}
          metric={stats?.[card.key]}
          currency={stats?.currency}
          loading={loading}
          comparisonLabel={comparisonLabel}
        />
      ))}
    </div>
  );
}

function StatCard({ card, metric, currency, loading, comparisonLabel }) {
  const Icon = card.icon;
  const change = metric?.change ?? 0;
  const positive = change > 0;

  const TrendIcon = positive ? ArrowUpRightIcon : ArrowDownRightIcon;

  return (
    <Card
      className={cn(
        card.featured && "sm:col-span-2 bg-card ring-1 ring-primary/15",
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {card.label}
          </p>
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground",
              card.featured && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        {loading ? (
          <>
            <Skeleton
              className={cn("h-8 w-28", card.featured && "h-10 w-44")}
            />
            <Skeleton className="mt-auto h-4 w-32" />
          </>
        ) : (
          <>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight",
                card.featured && "text-4xl",
              )}
            >
              {card.money
                ? formatCurrency(metric?.value, currency)
                : formatNumber(metric?.value)}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {change ? (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold",
                      positive ? "text-green-500" : "text-destructive",
                    )}
                  >
                    <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatPercent(change)}
                  </span>
                  <span className="text-muted-foreground">
                    {comparisonLabel}
                  </span>
                </>
              ) : (
                ""
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
