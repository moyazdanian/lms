import React from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actions, className, children }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {children}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          {description ?
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> :
          null}
        </div>
        {actions ?
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> :
        null}
      </div>
    </div>);

}