import Link from "next/link";
import { Compass, TriangleAlert } from "lucide-react";

// One screen for every dead end: a missing page (404) and a page that failed to
// render (500). It borrows the storefront's empty-state shape — soft icon chip,
// bold heading, muted copy, blue primary action — so a dead end still looks like
// the rest of the site. The numbers in `code` are the only signal that something
// is different; they sit quietly under the actions instead of shouting.

const actionBase =
  "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const primaryActionClass = `${actionBase} bg-blue-600 text-white hover:bg-blue-700`;
export const secondaryActionClass = `${actionBase} border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800`;

export function StatusLink({ href, children, variant = "primary" }) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? primaryActionClass : secondaryActionClass}
    >
      {children}
    </Link>
  );
}

const icons = { 404: Compass, 500: TriangleAlert };

export default function StatusScreen({ code, title, description, children, footnote }) {
  const Icon = icons[code] ?? TriangleAlert;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-9 w-9 text-gray-400" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {title}
      </h1>

      <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {children && (
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          {children}
        </div>
      )}

      <p className="mt-10 text-xs font-medium text-gray-500 dark:text-gray-500">
        Error {code}
        {footnote ? ` · ${footnote}` : ""}
      </p>
    </div>
  );
}
