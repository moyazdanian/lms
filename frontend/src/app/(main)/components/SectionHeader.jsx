import Link from "next/link";

/**
 * One left-aligned section header used across the homepage — replaces the
 * four identical centered heading blocks that made the old page feel dated.
 * The optional "View all" link anchors to the matching catalog page.
 */
export default function SectionHeader({ title, content, viewAllHref, viewAllLabel = "View all" }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div className="max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title || "From the admin panel"}
        </h2>
        {content && (
          <p className="mt-2 text-sm sm:text-base text-neutral-400 leading-relaxed">
            {content}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-neutral-300 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
