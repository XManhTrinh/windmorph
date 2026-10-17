'use client';

import { Button, SnackbarHost, useSnackbarHostState } from '@windmorph/react';
import { useState } from 'react';

/**
 * A `SnackbarHost` driven by a `SnackbarHostState` from `useSnackbarHostState()`. Each
 * button queues a snackbar with `showSnackbar`; the host shows them one at a time in a
 * polite live region, positioned here at the bottom of a bounded container. `showSnackbar`
 * resolves `'action-performed'` or `'dismissed'`, so the "With action" button can react to
 * Undo. A snackbar with an action stays until it is acted on or dismissed; Alt+G moves
 * focus to it and Escape dismisses it. A plain one leaves after four seconds, pausing while
 * the pointer or focus is on it. "Replace" swaps the snackbar on screen for an updated one.
 */
export function SnackbarHostDemo() {
  const snackbar = useSnackbarHostState();
  const [result, setResult] = useState('none');
  return (
    <div className="relative flex h-[320px] w-full flex-col gap-4 overflow-hidden rounded-corner-large bg-surface-container p-4">
      <div className="flex flex-wrap gap-2">
        <Button onPress={() => void snackbar.showSnackbar('Photo saved')}>Short</Button>
        <Button
          onPress={async () =>
            setResult(
              await snackbar.showSnackbar({ message: 'Message archived', actionLabel: 'Undo' }),
            )
          }
        >
          With action
        </Button>
        <Button
          onPress={() =>
            void snackbar.showSnackbar({
              message: 'Draft discarded',
              withDismissAction: true,
              duration: 'long',
            })
          }
        >
          Dismissible
        </Button>
        <Button
          variant="outlined"
          onPress={() => void snackbar.showSnackbar('2 photos uploaded', { replace: true })}
        >
          Replace
        </Button>
      </div>
      <p className="text-body-medium text-on-surface-variant">Last result: {result}</p>
      <SnackbarHost state={snackbar} className="absolute inset-x-0 bottom-0" />
    </div>
  );
}
