"use client";

import "./globals.css";
import StatusScreen, {
  primaryActionClass,
  secondaryActionClass,
} from "@/components/StatusScreen";

// The last boundary: an error thrown by a root layout (the storefront's own
// layout, for example) leaves no page to render, so this file replaces the
// whole document. It has to supply <html> and <body> itself and import the
// stylesheet, because the layout that normally does that is the thing that
// failed.
export default function GlobalError({ error }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <StatusScreen
          code="500"
          title="The site couldn't load"
          description="Something went wrong before this page could be shown. Reload the page — if it keeps happening, send the error code below to the site administrator."
          footnote={error?.digest ? `Reference ${error.digest}` : undefined}
        >
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={primaryActionClass}
          >
            Reload the page
          </button>
          <a href="/" className={secondaryActionClass}>
            Back to home
          </a>
        </StatusScreen>
      </body>
    </html>
  );
}
