"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Formik } from "formik";
import {
  emailSchema,
  passwordSchema,
  YupObject,
} from "@/utilities/validation/ValidationSchema";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useLogin } from "@/hooks/useLogin";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function Login() {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-950 p-6 shadow-2xl dark:shadow-gray-600">
        <h1 className="mb-6 text-center text-2xl font-semibold">Login</h1>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={YupObject({
            email: emailSchema,
            password: passwordSchema,
          })}
          onSubmit={(values, { resetForm, setErrors }) => {
            try {
              loginMutation.mutate({
                email: values.email,
                password: values.password,
              });
            } catch (err) {
              if (err.status === 422 && err.data?.errors) {
                setErrors(err.data.errors);
              }
            }
          }}
        >
          {({ errors, touched, handleSubmit, getFieldProps }) => (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <Input
                type="text"
                name="email"
                placeholder="Email"
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
                  name="password"
                  placeholder="Password"
                  className="pr-10"
                  {...getFieldProps("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Eye className="h-6 w-6" aria-hidden="true" />
                  )}
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
              <Button type="submit" className="w-full">
                {loginMutation.isPending ? <Spinner /> : "Login"}
              </Button>
            </form>
          )}
        </Formik>

        <div className="mt-4 text-sm text-center">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs uppercase tracking-wide text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <GoogleButton />

        <div className="mt-6 text-center text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
