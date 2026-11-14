"use client";

import Link from "next/link";
import StatusScreen, {
  primaryActionClass,
  secondaryActionClass,
} from "@/components/StatusScreen";

// Any render error below the storefront layout lands here instead of Next's
// unstyled error screen. `reset` re-renders the segment, which is enough for
// the common case: a request that failed while the page was being rendered.
export default function MainError({ error, reset }) {
  return (
    <StatusScreen
      code="500"
      title="This page couldn't load"
      description="Something went wrong while loading this page. Try again — if it keeps happening, send the error code below to the site administrator."
      footnote={error?.digest ? `Reference ${error.digest}` : undefined}
    >
      <button type="button" onClick={() => reset()} className={primaryActionClass}>
        Try again
      </button>
      <Link href="/" className={secondaryActionClass}>
        Back to home
      </Link>
    </StatusScreen>
  );
}
