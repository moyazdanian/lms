// Renders the RichEditor HTML stored in the legal_pages table. Typography
// styling comes from @tailwindcss/typography (prose class). Empty or failed
// content shows a friendly "not published yet" placeholder.

export default function LegalPageContent({ title, content }) {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>{title}</h1>
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-muted-foreground">
          This page has not been published yet. Please check back soon.
        </p>
      )}
    </div>
  );
}
