// components/errors/ForbiddenError.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Lock, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForbiddenError({
  message = "You don't have permission to access this page.",
  showHomeButton = true,
  showBackButton = true,
  onBack,
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-100 dark:border-red-900/20 shadow-xl">
        <CardContent className="pt-6 pb-8 px-6">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-25" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-red-50 dark:bg-red-900/30 rounded-full">
                <Lock className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
            </div>

            {/* Error Code */}
            <div className="space-y-2">
              <h1 className="text-7xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                403
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Access Forbidden
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Restricted Area
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Possible reasons:
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>You need to purchase this course first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Your account doesn't have the required role</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>The content might be restricted to specific users</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onBack || (() => window.history.back())}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}

              {showHomeButton && (
                <Button
                  asChild
                  className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              )}
            </div>

            {/* Contact Support */}
            <p className="text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
              If you believe this is a mistake, please{" "}
              <Link
                href="/contact"
                className="text-red-500 hover:underline font-medium"
              >
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
