"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export const useAuthRedirect = ({ type = "guest" }) => {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (type === "guest" && user) {
      // Only staff belong in the dashboard; a student sent there hits its 403.
      router.replace(
        user.role === "admin" || user.role === "instructor"
          ? "/dashboard"
          : "/"
      );
      return;
    }

    if (type === "protected" && !user) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router, user, isLoading, type]);

  return checked;
};
