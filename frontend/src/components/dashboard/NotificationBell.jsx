"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeColors = {
  success: "border-l-green-500 bg-green-50 dark:bg-green-950/30",
  warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
  danger:  "border-l-red-500 bg-red-50 dark:bg-red-950/30",
  info:    "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
};

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markReadMutation, markAllReadMutation } =
    useNotifications();

  const handleClick = (n) => {
    if (!n.read_at) markReadMutation.mutate(n.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No notifications yet
            </p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "px-4 py-3 border-l-4 cursor-pointer transition-opacity",
                  typeColors[n.data.type] ?? typeColors.info,
                  n.read_at ? "opacity-60" : "opacity-100"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{n.data.title}</p>
                  {!n.read_at && (
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {n.data.body}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="text-xs text-blue-600 hover:underline w-full text-center"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
