import React from 'react';
import { Button } from '../ui/button';
import { getStatusMeta } from '@/lib/status';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * A single Laravel notification row. Title, body and UI type all come from
 * `notification.data` — never from the database `type` column.
 */
export function NotificationItem({ notification, onMarkRead, marking }) {
  const meta = getStatusMeta('notification', notification.data?.type);
  const Icon = meta.icon;
  const unread = !notification.read_at;

  const toneClasses = {
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive'
  };

  return (
    <li
      className={cn(
        'flex gap-3 px-4 py-4 sm:px-5',
        unread && 'bg-accent/40'
      )}>
      
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          toneClasses[notification.data?.type] || 'bg-muted text-muted-foreground'
        )}>
        
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold">{notification.data?.title}</p>
          <span className="text-xs font-medium text-muted-foreground">
            {meta.label}
          </span>
          {unread ?
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Unread
            </span> :
          null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{notification.data?.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <time dateTime={notification.created_at} title={formatDateTime(notification.created_at)}>
            {formatRelativeTime(notification.created_at)}
          </time>
        </p>
      </div>

      {unread ?
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 self-start"
        disabled={marking}
        onClick={() => onMarkRead(notification.id)}>
        
          Mark as Read
        </Button> :
      null}
    </li>);

}