"use client";
import React from "react";
import { getNavigationForRole } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";

function isItemActive(item, pathname) {
  if (pathname === item.href) return true;
  // Keep the dashboard item active only on the dashboard itself.
  if (item.href === "/dashboard") return false;
  // "My Courses" stays active on nested course routes, but not on /create.
  if (item.href === "/dashboard/teaching") {
    return (
      pathname.startsWith("/dashboard/teaching/") &&
      !pathname.endsWith("/create")
    );
  }
  if (item.href === "/dashboard/earnings") {
    return (
      pathname.startsWith("/dashboard/earnings/") &&
      !pathname.endsWith("/sales") &&
      !pathname.endsWith("/payouts")
    );
  }
  return pathname.startsWith(`${item.href}/`);
}

/** Shared navigation list — the desktop sidebar and the mobile sheet both use it. */
export function SidebarNav({ role, pathname, collapsed = false }) {
  const groups = getNavigationForRole(role);

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          {collapsed ? (
            <div className="mx-auto h-px w-6 bg-border" aria-hidden="true" />
          ) : (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item, pathname);
              const link = (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active && "text-primary",
                    )}
                    aria-hidden="true"
                  />

                  {collapsed ? null : (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
