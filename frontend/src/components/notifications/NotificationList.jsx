import React from "react";
import { BellIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";

export function NotificationList({
  notifications,
  loading,
  error,
  onRetry,
  onMarkRead,
  marking,
  filter,
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;

  if (!notifications.length) {
    return (
      <EmptyState
        icon={BellIcon}
        title="You're all caught up."
        description={
          filter === "unread"
            ? "You have no unread notifications."
            : "You don't have any notifications."
        }
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-border">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            marking={marking}
          />
        ))}
      </ul>
    </Card>
  );
}
