'use client';

import { Button } from '@windmorph/react';
import { ConfirmDialog } from '@windmorph/react-pro';
import { useRef, useState } from 'react';

/** Stands in for a request: the first try fails, the next one works. */
function useFlakyRequest() {
  const tries = useRef(0);
  return () =>
    new Promise<void>((resolve, reject) => {
      tries.current += 1;
      const fails = tries.current % 2 === 1;
      setTimeout(() => (fails ? reject(new Error('Request failed')) : resolve()), 1200);
    });
}

/**
 * An action that can't be undone, by promise: the dialog is locked while the promise runs,
 * closes when it resolves and stays open when it rejects. The failure's words are the
 * app's, through `error`.
 */
export function ConfirmDialogRemove() {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const request = useFlakyRequest();

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="tonal" onPress={() => setOpen(true)}>
        Remove Alex
      </Button>
      <p role="status" className="min-h-5 text-body-medium text-on-surface-variant">
        {removed ? 'Alex was removed.' : ''}
      </p>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFailed(false);
        }}
        title="Remove Alex from the team?"
        description="They lose access straight away. You can invite them again."
        confirmLabel="Remove"
        destructive
        error={failed ? "That didn't work. Try again." : null}
        onConfirm={async () => {
          setFailed(false);
          try {
            await request();
            setRemoved(true);
          } catch (error) {
            setFailed(true);
            // A rejected promise keeps the dialog open.
            throw error;
          }
        }}
      />
    </div>
  );
}
