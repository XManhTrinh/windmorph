'use client';

import { Button, TextField } from '@windmorph/react';
import { useActionState } from 'react';

/** Stands in for a server call: resolves after 1.5 seconds. */
function saveProfile(_previous: string | null, data: FormData): Promise<string> {
  const name = String(data.get('name') ?? '').trim() || 'your profile';
  return new Promise((resolve) => setTimeout(() => resolve(`Saved ${name}.`), 1500));
}

/**
 * `pending` while a form action runs: the label gives way to a loading indicator after 200ms,
 * the button keeps its width and focus, presses (and Enter in the field) don't submit again,
 * and its name becomes "Save, Loading". The result is announced by the app, here in a status.
 */
export function ButtonPending() {
  const [message, submit, isPending] = useActionState(saveProfile, null);
  return (
    <form action={submit} className="flex flex-wrap items-center gap-4">
      <TextField name="name" label="Name" defaultValue="Priya" autoComplete="name" />
      <Button type="submit" pending={isPending}>
        Save
      </Button>
      <p role="status" className="text-body-medium text-on-surface-variant">
        {message}
      </p>
    </form>
  );
}
