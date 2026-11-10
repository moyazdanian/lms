import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll } from
'../ui/table';
import { Card } from '../ui/card';
import { StatusBadge } from '../common/StatusBadge';
import { CourseActions } from './CourseActions';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import Link from 'next/link';

/** List view for My Courses. Same data and actions as the grid card. */
export function CourseTable({ courses, onChanged }) {
  return (
    <Card>
      <TableScroll>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) =>
            <TableRow key={course.id}>
                <TableCell className="min-w-[280px]">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                      <img
                      src={course.thumbnail}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover" />
                    
                    </span>
                    <span className="min-w-0">
                      <Link
                      href={`/dashboard/teaching/courses/${course.id}`}
                      className="block truncate font-medium hover:underline">
                      
                        {course.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {course.category?.name || course.category_id?.name || 'Uncategorized'}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge domain="course" status={course.status} />
                    <StatusBadge
                      domain="approval"
                      status={course.approval_status}
                    />
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {formatCurrency(
                  course.discount_price ?? course.price,
                  course.currency
                )}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(course.students ?? course.enrollments_count)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(course.sales)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {course.rating ? Number(course.rating).toFixed(1) : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(course.updated_at)}
                </TableCell>
                <TableCell className="text-right">
                  <CourseActions course={course} onChanged={onChanged} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableScroll>
    </Card>);

}