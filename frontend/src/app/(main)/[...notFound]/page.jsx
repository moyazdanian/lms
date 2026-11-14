import { notFound } from "next/navigation";

// A URL that matches no route has no page of its own. This catch-all gives it
// one: it renders nothing and hands the request to the storefront's 404, so an
// unknown address still arrives with the navbar, the footer and a way back
// instead of Next's bare default page.
export default function CatchAll() {
  notFound();
}
