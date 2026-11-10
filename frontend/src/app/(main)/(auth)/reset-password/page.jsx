"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api/authApi";

// useSearchParams() needs a Suspense boundary for statically prerendered
// routes (next build fails otherwise).
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-2xl dark:shadow-gray-600">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Reset Password
        </h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The backend email links here as /reset-password?token=...&email=...
  // (see ResetPassword::createUrlUsing in AppServiceProvider).
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password updated. You can now sign in.");
      router.replace("/login");
    } catch (err) {
      setError(
        err?.response?.data?.errors?.email?.[0] ||
          err?.response?.data?.errors?.password?.[0] ||
          err?.response?.data?.message ||
          "Could not reset the password. Please request a new link."
      );
    } finally {
      setIsPending(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">
          This reset link is invalid or incomplete. Please request a new one.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/forgot-password")}
        >
          Request new link
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      <p className="text-center text-xs text-gray-500">
        Setting a new password for{" "}
        <span className="font-medium">{email}</span>
      </p>

      <Input
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isPending}
      />

      <div className="space-y-1">
        <Input
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          disabled={isPending}
        />
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
