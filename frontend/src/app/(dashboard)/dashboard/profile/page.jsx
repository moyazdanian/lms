"use client";
import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useUser } from "@/hooks/useUser";
import { InstructorForm } from "@/components/account/InstructorForm";
import { ConnectedAccounts } from "@/components/account/ConnectedAccounts";

export default function ProfilePage() {
  const { data: user, isPending, isFetching, error } = useUser();


  const loading = isPending || isFetching;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and sign-in security."
      />

      {loading ? (
        <Card aria-busy="true">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <ProfileForm user={user} />
      )}

      {(user.role === "instructor" || user.role === "admin") && (
        <InstructorForm user={user} />
      )}

      <PasswordForm />

      <ConnectedAccounts />
    </div>
  );
}
