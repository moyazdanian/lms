// components/errors/InternalServerError.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Home,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileWarning,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function InternalServerError({
  error,
  reset,
  message = "Something went wrong on our end. We're working to fix it.",
  showDetails = process.env.NODE_ENV === "development",
}) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const handleRefresh = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-100 dark:border-amber-900/20 shadow-xl">
        <CardContent className="pt-6 pb-8 px-6">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/20 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                <FileWarning className="w-12 h-12 text-amber-500 dark:text-amber-400 animate-bounce" />
              </div>
            </div>

            {/* Error Code */}
            <div className="space-y-2">
              <h1 className="text-7xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                500
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Internal Server Error
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Unexpected Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button asChild variant="outline" className="gap-2">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Error Details (for development) */}
            {showDetails && error && (
              <div className="border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Error Details
                  </span>
                  {showErrorDetails ? (
                    <ChevronUp className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-500" />
                  )}
                </button>

                {showErrorDetails && (
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 text-left">
                    <pre className="text-xs text-amber-600 dark:text-amber-400 overflow-auto max-h-40 p-2 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-800">
                      {error.message || error.toString()}
                    </pre>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer">
                          Stack trace
                        </summary>
                        <pre className="text-xs text-amber-600 dark:text-amber-400 overflow-auto max-h-60 mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-800">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Support Options */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                What would you like to do?
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh the page
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  asChild
                >
                  <Link href="/contact">
                    <Mail className="w-4 h-4" />
                    Contact support
                  </Link>
                </Button>
              </div>
            </div>

            {/* Error ID (for tracking) */}
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Error ID:{" "}
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
              <br />
              If the problem persists, please contact support with this ID.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
