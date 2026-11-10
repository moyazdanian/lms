"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUser } from "@/lib/api/authApi";
import { clearUserScopedQueries } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";

// Backend → frontend landing page after the Google round-trip. The backend
// redirects here with ?status=success|error&... — see SocialAuthController.
const ERROR_MESSAGES = {
  provider_disabled:
    "Google sign-in is not enabled right now. Please use email and password.",
  email_exists:
    "This email is already registered. Sign in with your password, then connect Google from your profile page.",
  account_inactive:
    "Your account is inactive. Please contact support.",
  instructor_rejected:
    "Your instructor account has been rejected. Please contact support.",
  oauth_invalid_state:
    "Your sign-in attempt expired. Please try again.",
  oauth_cancelled:
    "Sign-in with Google was cancelled.",
  not_authenticated:
    "Please sign in first, then connect your Google account.",
  provider_already_connected:
    "This Google account is already connected to another user.",
  provider_error:
    "Something went wrong talking to Google. Please try again.",
};

const CONTAINER_CLASS =
  "flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center";

// useSearchParams() requires a Suspense boundary for statically prerendered
// routes (next build fails otherwise), so the page shell wraps the content.
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackPending />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function CallbackPending() {
  return (
    <div className={CONTAINER_CLASS}>
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-gray-500">Completing sign-in…</p>
    </div>
  );
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const status = searchParams.get("status");
    const errorCode = searchParams.get("error");
    const action = searchParams.get("action");
    const redirectTo = searchParams.get("redirect");

    if (status !== "success") {
      setError(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.provider_error);
      return;
    }

    (async () => {
      try {
        // The backend already set the session cookie — pull the user into
        // React Query so Navbar/dashboard render as signed-in immediately.
        const user = await getUser();

        // Drop cached data belonging to a previously signed-in account,
        // exactly like AuthContext.signIn does for password login.
        clearUserScopedQueries(queryClient);
        queryClient.setQueryData(["user"], user);

        toast.success(
          action === "connected"
            ? "Google account connected."
            : `Welcome, ${user.name || user.email}!`
        );

        // In-app paths only — the backend enforces the same rule.
        const safeRedirect =
          redirectTo && redirectTo.startsWith("/") ? redirectTo : null;

        // Mirror useLogin: staff land on the dashboard, students on profile.
        const fallback =
          user.role === "admin" || user.role === "instructor"
            ? "/dashboard"
            : "/dashboard/profile";

        router.replace(safeRedirect ?? fallback);
      } catch {
        setError(
          "Signed in, but we could not load your account. Please refresh the page."
        );
      }
    })();
  }, [searchParams, router, queryClient]);

  if (error) {
    return (
      <div className={CONTAINER_CLASS}>
        <p className="max-w-md text-sm text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" onClick={() => router.replace("/login")}>
          Back to login
        </Button>
      </div>
    );
  }

  return <CallbackPending />;
}
