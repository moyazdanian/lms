"use client";
import React from "react";
import { GraduationCapIcon } from "lucide-react";
import { useSettings } from "@/hooks/dashboard/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export function BrandMark({ compact = false }) {
  const { data: settings, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <span className="flex items-center gap-2.5" aria-label="Loading brand">
        <Skeleton className="h-9 w-9 rounded-md" />
        {!compact && (
          <span className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </span>
        )}
      </span>
    );
  }

  if (error || !settings.settings) {
    return (
      <span className="flex items-center gap-2.5 text-destructive" role="alert">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-sm font-bold">
          !
        </span>
        {!compact && (
          <span className="text-sm font-semibold leading-tight">
            Could not get data
            <span className="block text-xs font-normal text-destructive/80">
              Unable to load brand settings
            </span>
          </span>
        )}
      </span>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Image src={settings?.settings?.logo} alt="Brand Logo" width={36} height={36} />
      </span>
      {compact ? null : (
        <span className="text-sm font-semibold leading-tight">
          {settings.site_name}
        </span>
      )}
    </Link>
  );
}
