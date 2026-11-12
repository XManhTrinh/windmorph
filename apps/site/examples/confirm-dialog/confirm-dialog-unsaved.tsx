'use client';

import { Button, TextField } from '@windmorph/react';
import { useNavigationGuard } from '@windmorph/react/next';
import { ConfirmDialog } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * Leaving with unsaved changes: the core's `useNavigationGuard` holds the navigation and
 * this dialog asks. Type a name, then follow the link. "Discard" goes on to the page;
 * "Keep editing", Escape and the back gesture stay.
 */
export function ConfirmDialogUnsaved() {
  const [name, setName] = useState('');
  const [leaving, setLeaving] = useState<(() => void) | null>(null);
  useNavigationGuard({ when: name !== '', onAttempt: (proceed) => setLeaving(() => proceed) });

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <TextField label="Display name" value={name} onChange={setName} className="w-full" />
      <Button variant="text" href="/components/dialog">
        Go to the Dialog page
      </Button>
      <ConfirmDialog
        open={leaving !== null}
        onOpenChange={(open) => {
          if (!open) setLeaving(null);
        }}
        title="Discard your changes?"
        description="The name you typed hasn't been saved."
        confirmLabel="Discard"
        labels={{ cancel: 'Keep editing' }}
        onConfirm={() => {
          setLeaving(null);
          leaving?.();
        }}
      />
    </div>
  );
}
