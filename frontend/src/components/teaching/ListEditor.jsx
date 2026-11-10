import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FormField } from '../common/FormField';

/** Repeatable single-line inputs — used for objectives and requirements. */
export function ListEditor({
  id,
  label,
  hint,
  error,
  items,
  onChange,
  placeholder,
  addLabel = 'Add item',
  required = false
}) {
  const rows = items.length ? items : [''];

  function update(index, value) {
    const next = [...rows];
    next[index] = value;
    onChange(next);
  }

  function remove(index) {
    const next = rows.filter((_, position) => position !== index);
    onChange(next);
  }

  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      <ul className="space-y-2">
        {rows.map((item, index) =>
        <li key={index} className="flex items-center gap-2">
            <Input
            id={index === 0 ? id : `${id}-${index}`}
            value={item}
            placeholder={placeholder}
            aria-label={`${label} ${index + 1}`}
            onChange={(event) => update(index, event.target.value)} />
          
            <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            onClick={() => remove(index)}
            disabled={rows.length === 1 && !item}>
            
              <Trash2Icon aria-hidden="true" />
            </Button>
          </li>
        )}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => onChange([...rows, ''])}>
        
        <PlusIcon aria-hidden="true" />
        {addLabel}
      </Button>
    </FormField>);

}