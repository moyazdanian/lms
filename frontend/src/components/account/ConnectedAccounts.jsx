"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSocialAccounts,
  disconnectSocialAccount,
  startSocialAuth,
} from "@/lib/api/socialAuth";
import { GoogleButton } from "@/components/auth/GoogleButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PROVIDER_LABELS = {
  google: "Google",
};

/**
 * "Connected accounts" card for the profile page: shows linked OAuth
 * providers, lets the user connect more, and disconnects with the
 * keep-at-least-one-sign-in-method rule enforced by the API.
 */
export function ConnectedAccounts() {
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: getSocialAccounts,
  });

  const disconnect = async (account) => {
    try {
      await disconnectSocialAccount(account.id);
      toast.success(
        `${PROVIDER_LABELS[account.provider] ?? account.provider} disconnected.`
      );
      await refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Could not disconnect the account."
      );
    }
  };

  const connect = () => {
    // Refresh the list when the OAuth round-trip lands back on the app.
    queryClient.removeQueries({ queryKey: ["social-accounts"] });
    startSocialAuth("google", { intent: "connect" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Connected accounts</CardTitle>
        <CardDescription>
          Sign in with an external provider, or use it as an alternative to a
          password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <>
            {(data?.social_accounts ?? []).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm font-semibold">
                      {(PROVIDER_LABELS[account.provider] ?? "?").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {PROVIDER_LABELS[account.provider] ?? account.provider}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.email ?? "—"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data?.has_password && (data?.social_accounts ?? []).length === 1}
                  onClick={() => disconnect(account)}
                >
                  Disconnect
                </Button>
              </div>
            ))}

            {!(data?.social_accounts ?? []).some((a) => a.provider === "google") && (
              <GoogleButton
                intent="connect"
                label="Connect Google account"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
