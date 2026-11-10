import React from "react";
import { Badge } from "../ui/badge";
import { getStatusMeta } from "@/lib/status";

/** Status shown as icon + label + color, never color alone. */
export function StatusBadge({ domain, status, className }) {
  const meta = getStatusMeta(domain, status);
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className={className || meta.className}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}
