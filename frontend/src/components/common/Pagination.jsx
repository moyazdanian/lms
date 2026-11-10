import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function Pagination({ meta, onPageChange, className }) {
  if (!meta || meta.last_page <= 1) return null;
  const { current_page: current, last_page: last, total, per_page: perPage } = meta;
  const from = (current - 1) * perPage + 1;
  const to = Math.min(total, current * perPage);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col-reverse items-center justify-between gap-3 sm:flex-row ${className || ''}`}>
      
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}>
          
          <ChevronLeftIcon aria-hidden="true" />
          Previous
        </Button>
        <span className="text-xs font-medium text-muted-foreground">
          Page {current} of {last}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= last}>
          
          Next
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
    </nav>);

}