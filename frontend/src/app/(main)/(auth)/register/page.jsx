"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Formik } from "formik";
import {
  emailSchema,
  passwordConfirmSchema,
  passwordSchema,
  nameSchema,
  YupObject,
} from "@/utilities/validation/ValidationSchema";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuthRedirect } from "@/utilities/hooks/useAuthRedirect";
import Loading from "@/app/loading";
import { useRegister } from "@/hooks/useRegister";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const registerMutation = useRegister();
  const checked = useAuthRedirect({ type: "guest" });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  if (!checked) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-2xl dark:shadow-gray-600">
        <h1 className="mb-6 text-center text-2xl font-semibold">Register</h1>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
          }}
          validationSchema={YupObject({
            email: emailSchema,
            name: nameSchema,
            password: passwordSchema,
            password_confirmation: passwordConfirmSchema,
          })}
          onSubmit={async (values, { resetForm, setErrors }) => {
            try {
              registerMutation.mutate(values);
              resetForm();
            } catch (err) {
              if (err.status === 422 && err?.data?.errors) {
                setErrors(err.data.errors);
              }
            }
          }}
        >
          {({ errors, touched, handleSubmit, getFieldProps }) => (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Full name"
                {...getFieldProps("name")}
              />
              {errors.name && touched.name ? (
                <div className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm text-red-700 shadow-sm animate-shake">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.name}
                </div>
              ) : null}
              <Input
                type="text"
                placeholder="Email or Phone"
                {...getFieldProps("email")}
              />
              {errors.email && touched.email ? (
                <div className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm text-red-700 shadow-sm animate-shake">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.email}
                </div>
              ) : null}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pr-10"
                  {...getFieldProps("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {showPassword ? (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 7 9 7a16 16 0 01-3.1 3.8M6.2 6.2C3.6 8 2 12 2 12s4 7 10 7a10 10 0 004.1-.9"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && touched.password ? (
                <div className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm text-red-700 shadow-sm animate-shake">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.password}
                </div>
              ) : null}
              <div className="relative">
                <Input
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="pr-10"
                  {...getFieldProps("password_confirmation")}
                />
                <button
                  type="button"
                  aria-label={
                    showPasswordConfirmation
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                  onClick={() =>
                    setShowPasswordConfirmation((visible) => !visible)
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {showPasswordConfirmation ? (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 7 9 7a16 16 0 01-3.1 3.8M6.2 6.2C3.6 8 2 12 2 12s4 7 10 7a10 10 0 004.1-.9"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password_confirmation && touched.password_confirmation ? (
                <div className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm text-red-700 shadow-sm animate-shake">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.password_confirmation}
                </div>
              ) : null}
              <Button className="w-full">
                {registerMutation.isPending ? <Spinner /> : "Create Account"}
              </Button>
            </form>
          )}
        </Formik>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs uppercase tracking-wide text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <GoogleButton label="Sign up with Google" />

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
