import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DATE_RANGE_PRESETS, todayInput } from '@/lib/dateRanges';
import { formatDate } from '@/lib/format';

/**
 * Preset picker plus a custom range popover. Emits { preset, from, to } and
 * never triggers navigation — the pages refetch analytics in place.
 */
export function DateRangeFilter({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ from: value.from, to: value.to });
  const [error, setError] = useState(null);

  function handlePresetChange(preset) {
    // if (preset === 'custom') {
    //   setDraft({ from: value.from, to: value.to });
    //   setOpen(true);
    //   return;
    // }
    onChange({ preset });
  }

  // function applyCustom() {
  //   if (!draft.from || !draft.to) {
  //     setError('Choose both a start and an end date.');
  //     return;
  //   }
  //   if (new Date(draft.from) > new Date(draft.to)) {
  //     setError('The start date must come before the end date.');
  //     return;
  //   }
  //   setError(null);
  //   setOpen(false);
  //   onChange({ preset: 'custom', from: draft.from, to: draft.to });
  // }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className || ''}`}>
      <Select value={value.preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]" aria-label="Date range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGE_PRESETS.map((preset) =>
          <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon aria-hidden="true" />
            <span className="hidden sm:inline">
              {formatDate(value.from)} – {formatDate(value.to)}
            </span>
            <span className="sm:hidden">Dates</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="range-from">Start date</Label>
            <Input
              id="range-from"
              type="date"
              max={draft.to || todayInput()}
              value={draft.from || ''}
              onChange={(event) =>
              setDraft((current) => ({ ...current, from: event.target.value }))
              } />
            
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="range-to">End date</Label>
            <Input
              id="range-to"
              type="date"
              min={draft.from || undefined}
              max={todayInput()}
              value={draft.to || ''}
              onChange={(event) =>
              setDraft((current) => ({ ...current, to: event.target.value }))
              } />
            
          </div>
          {error ?
          <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p> :
          null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={applyCustom}>
              Apply range
            </Button>
          </div>
        </PopoverContent>
      </Popover> */}
    </div>);

}