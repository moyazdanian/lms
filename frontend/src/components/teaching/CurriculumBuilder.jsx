import React from 'react';
import { LayersIcon, PlusIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { SectionEditor } from './SectionEditor';
import { EmptyState } from '../common/EmptyState';
import { formatDuration } from '@/lib/format';

/**
 * Reusable curriculum builder: sections containing lessons, with reordering.
 * Reordering uses explicit move controls so it stays keyboard accessible.
 */
export function CurriculumBuilder({ sections, onChange, error }) {
  const lessonCount = sections.reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0
  );
  const totalDuration = sections.reduce(
    (total, section) =>
    total +
    (section.lessons || []).reduce(
      (sum, lesson) => sum + Number(lesson.duration || 0),
      0
    ),
    0
  );

  function addSection() {
    onChange([
    ...sections,
    { id: `s-${Date.now()}`, title: `Section ${sections.length + 1}`, lessons: [] }]
    );
  }

  function updateSection(index, section) {
    onChange(sections.map((item, position) => position === index ? section : item));
  }

  function moveSection(from, to) {
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {sections.length} section{sections.length === 1 ? '' : 's'} · {lessonCount} lesson
          {lessonCount === 1 ? '' : 's'} · {formatDuration(totalDuration)} total
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <PlusIcon aria-hidden="true" />
          Add section
        </Button>
      </div>

      {error ?
      <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p> :
      null}

      {sections.length === 0 ?
      <EmptyState
        icon={LayersIcon}
        title="Your curriculum is empty"
        description="Start with a section, then add the lessons students will work through."
        action={
        <Button type="button" onClick={addSection}>
              <PlusIcon aria-hidden="true" />
              Add first section
            </Button>
        } /> :


      <ul className="space-y-3">
          {sections.map((section, index) =>
        <SectionEditor
          key={section.id}
          section={section}
          index={index}
          total={sections.length}
          onChange={(next) => updateSection(index, next)}
          onDelete={() =>
          onChange(sections.filter((_, position) => position !== index))
          }
          onMove={(to) => moveSection(index, to)} />

        )}
        </ul>
      }
    </div>);

}