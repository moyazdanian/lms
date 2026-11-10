"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsPending(true);
    try {
      // Backend throttles this to 5/min per email+IP (rate limiter "auth").
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.email?.[0] ||
          err?.response?.data?.message ||
          "Could not send the reset link. Please try again."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Forgot Password
        </h1>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If an account exists for <strong>{email}</strong>, we emailed you
              a password reset link. Please check your inbox.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
          </div>
        ) : (
          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending}
              />
              {error ? (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending…" : "Send reset link"}
            </Button>

            <p className="text-center text-xs text-gray-500">
              Remembered it?{" "}
              <Link href="/login" className="underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
