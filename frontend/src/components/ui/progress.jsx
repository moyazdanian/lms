"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}) {
  const normalizedValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={normalizedValue}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-primary/15",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full bg-primary transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
