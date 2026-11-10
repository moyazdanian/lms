import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate } from "@/components/blog/BlogCard";
import { avatarSrc } from "@/lib/avatar";
import { getBlogPostSafe } from "@/lib/api/blog";

// The admin edits posts at any time: nothing about a post may be baked at build.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostSafe(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.published_at || undefined,
      ...(post.cover_image ? { images: [{ url: post.cover_image }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostSafe(slug);

  if (!post) {
    notFound();
  }

  const date = formatPostDate(post.published_at);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/blog"
        className="text-sm text-neutral-400 transition-colors hover:text-white"
      >
        ← All posts
      </Link>

      <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-4 text-base leading-relaxed text-neutral-400">
          {post.excerpt}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3 text-sm text-neutral-400">
        {post.author?.name && (
          <Image
            src={avatarSrc(post.author.avatar)}
            alt=""
            width={32}
            height={32}
            quality={75}
            className="h-8 w-8 rounded-full object-cover"
          />
        )}
        <div className="flex flex-wrap items-center gap-x-2">
          {post.author?.name && (
            <span className="font-medium text-neutral-200">
              {post.author.name}
            </span>
          )}
          {post.author?.name && date && <span aria-hidden="true">·</span>}
          {date && <time dateTime={post.published_at}>{date}</time>}
        </div>
      </div>

      {post.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-neutral-800">
          <Image
            src={post.cover_image}
            alt=""
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            quality={80}
            priority
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-invert mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </article>
  );
}
