import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { getBlogPosts } from "@/lib/api/blog";

// Posts are written in the panel, so the list must not be baked at build.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  description: "Guides, deep dives and notes from the people teaching here.",
};

const PER_PAGE = 9;

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(Number(params?.page) || 1, 1);

  const { data: posts = [], meta = {} } = await getBlogPosts({
    page,
    per_page: PER_PAGE,
  });

  const currentPage = meta.current_page || page;
  const lastPage = meta.last_page || 1;

  return (
    <div className="mx-auto max-w-350 px-6 py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
          Guides, deep dives and notes from the people teaching here.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-white">No posts yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
            Nothing has been published on the blog so far. Check back soon — or
            start with the course catalog in the meantime.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-white/30 hover:text-white"
          >
            Browse courses
          </Link>
        </div>
      )}

      {lastPage > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-12 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row"
        >
          <p className="text-xs text-neutral-500" aria-live="polite">
            Page {currentPage} of {lastPage}
          </p>

          <div className="flex items-center gap-2">
            <PagerLink
              href={`/blog?page=${currentPage - 1}`}
              disabled={currentPage <= 1}
            >
              ← Previous
            </PagerLink>
            <PagerLink
              href={`/blog?page=${currentPage + 1}`}
              disabled={currentPage >= lastPage}
            >
              Next →
            </PagerLink>
          </div>
        </nav>
      )}
    </div>
  );
}

function PagerLink({ href, disabled, children }) {
  const classes =
    "rounded-full border border-white/15 px-4 py-1.5 text-sm transition-colors";

  if (disabled) {
    return (
      <span className={`${classes} pointer-events-none border-white/5 text-neutral-600`}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${classes} text-neutral-200 hover:border-white/30 hover:text-white`}
    >
      {children}
    </Link>
  );
}
