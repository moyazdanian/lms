import React from 'react';
import { LayoutGridIcon, ListIcon, SearchIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../ui/select';
import { COURSE_SORT_OPTIONS } from '@/config/courses';
import { getStatusOptions } from '@/lib/status';
import { cn } from '@/lib/utils';

export function CourseFilters({ filters, onChange, view, onViewChange }) {
  const statusOptions = getStatusOptions('course');

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-sm">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true" />
        
        <Input
          type="search"
          className="pl-9"
          placeholder="Search your courses"
          aria-label="Search courses"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value, page: 1 })} />
        
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(status) => onChange({ status, page: 1 })}>
          
          <SelectTrigger className="w-[150px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) =>
            <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(sort) => onChange({ sort })}>
          <SelectTrigger className="w-[180px]" aria-label="Sort courses">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSE_SORT_OPTIONS.map((option) =>
            <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <div
          role="group"
          aria-label="View mode"
          className="ml-auto flex items-center gap-1 rounded-md border border-border p-1">
          
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={cn('h-8 w-8', view === 'grid' && 'bg-muted')}
            onClick={() => onViewChange('grid')}>
            
            <LayoutGridIcon aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={cn('h-8 w-8', view === 'list' && 'bg-muted')}
            onClick={() => onViewChange('list')}>
            
            <ListIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>);

}