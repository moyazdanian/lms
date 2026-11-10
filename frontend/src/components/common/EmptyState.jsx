import React from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center',
        className
      )}>
      
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ?
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p> :
        null}
      </div>
      {action}
    </div>);

}