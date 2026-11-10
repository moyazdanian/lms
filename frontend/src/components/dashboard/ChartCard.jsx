import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { cn } from '@/lib/utils';

/**
 * Every chart on the dashboard shares one shell so loading, error and empty
 * states look and behave identically.
 */
export function ChartCard({
  title,
  description,
  action,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No data for this period',
  emptyDescription = 'Try widening the date range to see activity.',
  height = 280,
  className,
  children
}) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1">
        {loading ?
        <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-4 w-24" />
            <Skeleton style={{ height }} className="w-full" />
          </div> :
        error ?
        <ErrorState message={error.message} onRetry={onRetry} /> :
        isEmpty ?
        <EmptyState title={emptyTitle} description={emptyDescription} /> :

        <div style={{ height }} className="w-full">
            {children}
          </div>
        }
      </CardContent>
    </Card>);

}

export function ChartCardSkeleton({ height = 280, className }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton style={{ height }} className="w-full" />
      </CardContent>
    </Card>);

}