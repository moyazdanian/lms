"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCheckIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import PaginationComponent from "@/components/PaginationComponent";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { notificationsQuery, markReadMutation, markAllReadMutation } =
    useNotifications(page);

  const { data, isLoading, isFetching, error, refetch } = notificationsQuery;

  const { mutate: markOne, isPending: markingOne } = markReadMutation;

  const { mutate: markAll, isPending: markingAll } = markAllReadMutation;

  const loading = isLoading || isFetching;

  const notifications = data?.data ?? [];
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => notification.read_at === null)
      : notifications;

  function changeFilter(next) {
    setFilter(next);
    setPage(1);
  }

  async function handleMarkRead(id) {
    const result = await markOne.mutate(id);
    if (result.ok) {
      setItems((current) =>
        filter === "unread"
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              item.id === id
                ? { ...item, read_at: new Date().toISOString() }
                : item,
            ),
      );
    } else {
      toast.error(result.error?.message || "We could not mark that as read.");
    }
  }

  const unreadCount = data?.unread_count ?? 0;
  const hasMore = Boolean(
    data?.meta && data.meta.current_page < data.meta.last_page,
  );
  const initialLoading = loading && page === 1;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about your courses, payouts and support tickets."
        actions={
          <Button
            variant="outline"
            disabled={markingAll || unreadCount === 0}
            onClick={markAll}
          >
            <CheckCheckIcon aria-hidden="true" />
            {markingAll ? "Updating…" : "Mark All as Read"}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={changeFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
        <Badge variant={unreadCount ? "info" : "muted"} aria-live="polite">
          {unreadCount} unread
        </Badge>
      </div>

      <NotificationList
        notifications={filteredNotifications}
        loading={initialLoading}
        loadingMore={loading && page > 1}
        error={error}
        onRetry={refetch}
        onMarkRead={markOne}
        marking={markingOne}
        hasMore={hasMore}
        onLoadMore={() => setPage((current) => current + 1)}
        filter={filter}
      />

      <PaginationComponent
        currentPage={data?.meta?.current_page ?? page}
        totalPages={data?.meta?.last_page ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
