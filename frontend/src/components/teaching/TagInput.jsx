import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from '../common/FormField';

/** Free-form tags: type and press Enter, click × to remove. */
export function TagInput({ id, label, hint, error, tags, onChange }) {
  const [draft, setDraft] = useState('');

  function addTag() {
    const value = draft.trim().toLowerCase();
    if (!value || tags.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...tags, value]);
    setDraft('');
  }

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <Input
        id={id}
        value={draft}
        placeholder="Type a tag and press Enter"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addTag();
          }
          if (event.key === 'Backspace' && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={addTag} />
      
      {tags.length ?
      <ul className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) =>
        <li key={tag}>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium">
                {tag}
                <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 text-muted-foreground transition-colors duration-150 ease-out hover:bg-background hover:text-destructive"
              onClick={() => onChange(tags.filter((item) => item !== tag))}>
              
                  <XIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            </li>
        )}
        </ul> :
      null}
    </FormField>);

}