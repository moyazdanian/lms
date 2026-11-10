import Image from "next/image";
import Link from "next/link";

// A fixed locale/time zone keeps the rendered date identical on every server
// render (and avoids a hydration mismatch if the card is ever used client-side).
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(value) {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : DATE_FORMAT.format(date);
}

/**
 * One post card: cover (or a gradient placeholder when the admin uploaded
 * none), date/author line, title and excerpt. Used in the homepage "From the
 * blog" section and on /blog.
 */
export default function BlogCard({ post }) {
  const date = formatPostDate(post.published_at);
  const author = post.author?.name;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 transition-all hover:-translate-y-1 hover:border-white/20"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-800">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            quality={75}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              background:
                "radial-gradient(120% 120% at 15% 0%, rgba(251,113,133,0.22), transparent 55%), radial-gradient(120% 120% at 85% 100%, rgba(99,102,241,0.22), transparent 55%)",
            }}
          >
            <span className="text-3xl font-bold tracking-tight text-white/15">
              {post.title?.slice(0, 1)?.toUpperCase() || "B"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {(date || author) && (
          <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-neutral-500">
            {date && <time dateTime={post.published_at}>{date}</time>}
            {date && author && <span aria-hidden="true">·</span>}
            {author && <span>{author}</span>}
          </div>
        )}

        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
            {post.excerpt}
          </p>
        )}

        <span className="mt-auto pt-5 text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
          Read post{" "}
          <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
