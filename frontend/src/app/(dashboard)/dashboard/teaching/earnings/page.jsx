"use client";

import RoleGuard from "@/app/(dashboard)/dashboard/RoleGuard";
import InstructorMarketplace from "@/components/dashboard/instructor/InstructorMarketplace";

export default function InstructorEarningsPage() {
  return (
    <RoleGuard roles={["instructor", "admin"]}>
      <InstructorMarketplace />
    </RoleGuard>
  );
}
