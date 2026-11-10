import React from 'react';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

/** Label + hint + inline error wrapper used by every form in the app. */
export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required ?
          <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span> :
          null}
        </Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ?
      <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p> :
      null}
    </div>);

}

/** Props every input needs to be wired to its label and error message. */
export function fieldProps(id, error) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined
  };
}