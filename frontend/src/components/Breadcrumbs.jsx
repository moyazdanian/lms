"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Friendly labels for static route segments. Dynamic segments (slugs, ids)
// fall back to title-casing, so a slug like "react-basics" shows "React Basics".
const LABELS = {
  courses: "Courses",
  categories: "Categories",
  instructors: "Instructors",
  blog: "Blog",
  dashboard: "Dashboard",
  cart: "Cart",
  checkout: "Checkout",
  payment: "Payment",
  success: "Success",
  failed: "Failed",
  profile: "Profile",
  wishlist: "Wishlist",
  payments: "Payments",
  tickets: "Support",
  notifications: "Notifications",
  teaching: "Teaching",
  create: "Create",
  "become-instructor": "Become Instructor",
  login: "Login",
  register: "Register",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  me: "My Account",
  403: "Access Denied",
};

function labelFor(segment) {
  if (LABELS[segment]) return LABELS[segment];
  // Pure numbers / ids are not user-friendly as page titles.
  if (/^\d+$/.test(segment)) return "Details";
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Hide on the home page and anywhere under /api.
  if (!pathname || pathname === "/" || pathname.startsWith("/api")) return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = labelFor(segment);
    return { href, label, isLast };
  });

  return (
    <div className="container mx-auto px-4 pt-4 sm:pt-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" aria-label="Home">
                <Home className="size-3.5" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
