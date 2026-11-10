import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { formatCurrency } from '@/lib/format';

/** Gross revenue → platform fee → instructor earnings, for the selected period. */
export function EarningsBreakdown({ breakdown, currency, loading, className }) {
  const rows = [
  { label: 'Gross Revenue', value: breakdown?.gross_revenue, tone: 'default' },
  {
    label: `Platform Fee (${breakdown?.platform_fee_rate ?? 0}%)`,
    value: breakdown?.platform_fee,
    tone: 'negative'
  }];


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Earnings breakdown</CardTitle>
        <CardDescription>How the selected period splits out.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ?
        <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-7 w-2/3" />
          </div> :

        <dl className="space-y-3 text-sm">
            {rows.map((row) =>
          <div key={row.label} className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className={row.tone === 'negative' ? 'text-destructive' : undefined}>
                  {row.tone === 'negative' ? '−' : ''}
                  {formatCurrency(row.value, currency)}
                </dd>
              </div>
          )}
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <dt className="text-base font-semibold">Instructor Earnings</dt>
              <dd className="text-base font-semibold">
                {formatCurrency(breakdown?.instructor_earnings, currency)}
              </dd>
            </div>
          </dl>
        }
      </CardContent>
    </Card>);

}