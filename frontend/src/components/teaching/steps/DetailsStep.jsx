import React from 'react';
import { ListEditor } from '../ListEditor';
import { TagInput } from '../TagInput';

export function DetailsStep({ values, setField, errors }) {
  return (
    <div className="space-y-6">
      <ListEditor
        id="objectives"
        label="Learning objectives"
        hint="What students will be able to do"
        required
        error={errors.objectives}
        items={values.objectives}
        placeholder="e.g. Diagnose and fix rendering performance problems"
        addLabel="Add objective"
        onChange={(objectives) => setField('objectives', objectives)} />
      

      <ListEditor
        id="requirements"
        label="Requirements"
        hint="Prior knowledge or tools needed"
        error={errors.requirements}
        items={values.requirements}
        placeholder="e.g. Comfortable writing React components with hooks"
        addLabel="Add requirement"
        onChange={(requirements) => setField('requirements', requirements)} />
      

      <TagInput
        id="tags"
        label="Tags"
        hint="Helps students find this course"
        error={errors.tags}
        tags={values.tags}
        onChange={(tags) => setField('tags', tags)} />
      
    </div>);

}