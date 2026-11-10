import React from 'react';
import { formatDate } from '@/lib/format';

/** Shared Recharts tooltip so every chart reads the same way. */
export function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground">
        {formatDate(label, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((entry) =>
        <li key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true" />
          
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold">
              {formatValue ? formatValue(entry.value, entry.dataKey) : entry.value}
            </span>
          </li>
        )}
      </ul>
    </div>);

}