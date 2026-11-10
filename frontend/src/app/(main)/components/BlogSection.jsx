import BlogCard from "@/components/blog/BlogCard";
import SectionHeader from "./SectionHeader";

/**
 * Homepage section: the newest published posts. Header copy and visibility
 * come from the panel (Content > Homepage Content > blog), so the admin can
 * rename it, hide it, or change the "read all" label without a deploy.
 */
export default function BlogSection({ data, posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="pb-20">
      <div className="max-w-350 mx-auto px-6">
        <SectionHeader
          title={data?.title || "From the blog"}
          content={data?.content}
          viewAllHref="/blog"
          viewAllLabel={data?.badge || "Read all posts"}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
