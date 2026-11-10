import React, { useEffect, useRef } from "react";
import { CheckIcon } from "lucide-react";
import { validateStep } from "@/lib/validation/course";
import { cn } from "@/lib/utils";

/** Step list for the course builder — vertical list on desktop, horizontal scrollable pills on mobile. */
export function CourseStepNav({
  steps,
  stepIndex,
  values,
  visitedSteps,
  onSelect,
}) {
  const mobileListRef = useRef(null);

  // Keep the active pill visible when the step changes (e.g. "Continue" or
  // a validation blocker jumps to another step) on the mobile pill row.
  useEffect(() => {
    const list = mobileListRef.current;
    if (!list) return;
    const activeButton = list.querySelector('[aria-current="step"]');
    activeButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [stepIndex]);

  return (
    <nav aria-label="Course builder steps" className="min-w-0">
      {/* Mobile: edge fades hint that more steps exist; the row scrolls, not the page. */}
      <div className="relative min-w-0 lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
        />
        <ol
          ref={mobileListRef}
          className="scrollbar-thin flex gap-2 overflow-x-auto scroll-smooth pb-1"
        >
          {steps.map((step, index) => {
            const active = index === stepIndex;
            const complete =
              step.id !== "review" &&
              visitedSteps.has(step.id) &&
              Object.keys(validateStep(step.id, values)).length === 0;

            return (
              <li key={step.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 text-left text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                      complete
                        ? "border-transparent bg-success text-white"
                        : active
                          ? "border-primary-foreground/40 text-primary-foreground"
                          : "border-border",
                    )}
                  >
                    {complete ? (
                      <CheckIcon className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop: comfortable vertical list, unchanged behavior. */}
      <ol className="hidden flex-col gap-1 lg:flex">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const complete =
            step.id !== "review" &&
            visitedSteps.has(step.id) &&
            Object.keys(validateStep(step.id, values)).length === 0;

          return (
            <li key={step.id} className="w-full">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full min-h-[44px] items-center gap-2.5 rounded-md px-3 text-left text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    complete
                      ? "border-success bg-success text-white"
                      : active
                        ? "border-primary text-primary"
                        : "border-border",
                  )}
                >
                  {complete ? (
                    <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
