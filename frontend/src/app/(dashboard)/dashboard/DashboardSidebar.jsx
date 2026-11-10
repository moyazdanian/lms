"use client";
import React from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { BrandMark } from "./BrandMark";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  role,
  pathname,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <BrandMark compact={collapsed} />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
        <SidebarNav role={role} pathname={pathname} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "border-t border-border p-3",
          collapsed && "flex justify-center",
        )}
      >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon-sm" : "sm"}
                onClick={onToggleCollapsed}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  !collapsed && "w-full justify-start text-muted-foreground",
                )}
              >
                {collapsed ? (
                  <PanelLeftOpenIcon aria-hidden="true" />
                ) : (
                  <>
                    <PanelLeftCloseIcon aria-hidden="true" />
                    Collapse
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
      </div>
    </aside>
  );
}
