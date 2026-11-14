import StatusScreen, { StatusLink } from "@/components/StatusScreen";

// Reached when a storefront page calls notFound(): an unknown course, category,
// instructor or blog slug. Rendered inside the storefront layout, so the navbar
// and footer stay put and the visitor can keep browsing.
export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="This page doesn't exist"
      description="The link may be out of date, or the course, lesson or post you're looking for was renamed or unpublished."
    >
      <StatusLink href="/courses">Browse courses</StatusLink>
      <StatusLink href="/" variant="secondary">
        Back to home
      </StatusLink>
    </StatusScreen>
  );
}
