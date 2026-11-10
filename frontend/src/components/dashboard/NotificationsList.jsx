"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const typeColors = {
  success: "border-l-green-500",
  warning: "border-l-yellow-500",
  danger:  "border-l-red-500",
  info:    "border-l-blue-500",
};

const typeBg = {
  success: "bg-green-50 dark:bg-green-950/20",
  warning: "bg-yellow-50 dark:bg-yellow-950/20",
  danger:  "bg-red-50 dark:bg-red-950/20",
  info:    "bg-blue-50 dark:bg-blue-950/20",
};

export default function NotificationsList() {
  const {
    notifications,
    unreadCount,
    notificationsQuery,
    markReadMutation,
    markAllReadMutation,
  } = useNotifications();

  if (notificationsQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">
            You&apos;ll see important messages from admin here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read_at && markReadMutation.mutate(n.id)}
              className={cn(
                "border-l-4 rounded-r-lg px-4 py-4 cursor-pointer transition-all",
                typeColors[n.data.type] ?? typeColors.info,
                typeBg[n.data.type] ?? typeBg.info,
                !n.read_at && "shadow-sm",
                n.read_at && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{n.data.title}</p>
                {!n.read_at && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">
                {n.data.body}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                { new Date(n.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
