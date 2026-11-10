"use client";

import { redirect } from "next/navigation";
import Loading from "@/app/loading";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function RoleGuard({ roles = [], children }) {
  const { isLoading, hasRole } = useAuthGuard(roles);

  if (isLoading) {
    return <Loading />;
  }

  if (!hasRole) {
    redirect("/403");
  }

  return children;
}
