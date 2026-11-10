"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useUser } from "@/hooks/useUser";
import Loading from "../../loading";
import { ErrorState } from "@/components/common/ErrorState";
import AuthGuard from "@/app/AuthGuard";

export default function DashboardShell({ children }) {
  const { data: user, isPending, error } = useUser();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState message="Failed to load user data. Please try again later." />
    );
  }

  if (!user) {
    return (
      <ErrorState message="User not found. Please log in." />
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-muted/40">
        <DashboardSidebar
          role={user.role}
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapsed={() =>
            setCollapsed((value) => !value)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            mobileNavOpen={mobileNavOpen}
            onMobileNavOpenChange={setMobileNavOpen}
          />

          <main
            id="main"
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}