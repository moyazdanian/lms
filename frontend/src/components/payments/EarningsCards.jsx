import React from "react";
import {
  BanknoteIcon,
  CalendarIcon,
  HourglassIcon,
  PiggyBankIcon,
  WalletIcon,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ErrorState } from "../common/ErrorState";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    key: "available_balance",
    label: "Available Balance",
    icon: WalletIcon,
    featured: true,
    hint: "Ready to withdraw",
  },
  { key: "total_revenue", label: "Total Revenue", icon: PiggyBankIcon },
  { key: "pending_earnings", label: "Pending Balance", icon: HourglassIcon },
  { key: "paid_earnings", label: "Paid Out", icon: BanknoteIcon },
  
];

export function EarningsCards({ earnings, loading, error, onRetry }) {
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            className={cn(
              card.featured && "xl:col-span-1 ring-1 ring-primary/15",
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
                <Skeleton className="h-8 w-32" />
              ) : (
                <p
                  className={cn(
                    "text-2xl font-semibold tracking-tight",
                    card.featured && "text-3xl",
                  )}
                >
                  {formatCurrency(
                    earnings?.[card.key].value,
                    earnings?.currency,
                  )}
                </p>
              )}
              <p className="mt-auto text-xs text-muted-foreground">
                {card.hint || "Across all courses"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
