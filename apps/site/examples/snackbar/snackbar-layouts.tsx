'use client';

import { Snackbar } from '@windmorph/react';

/**
 * The snackbar layouts: a message on its own, with a text action, with a dismiss (×)
 * button, and — for a long action label — the action on its own line. A snackbar shown
 * directly like this is handy for custom placement; most apps queue them through a
 * {@link SnackbarHost}.
 */
export function SnackbarLayouts() {
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-4">
      <Snackbar>Photo saved</Snackbar>
      <Snackbar actionLabel="Undo" onAction={() => {}}>
        Message archived
      </Snackbar>
      <Snackbar actionLabel="Retry" onAction={() => {}} onDismiss={() => {}}>
        Couldn’t send message
      </Snackbar>
      <Snackbar
        actionLabel="Open settings"
        actionOnNewLine
        onAction={() => {}}
        onDismiss={() => {}}
      >
        Notifications are turned off for this app
      </Snackbar>
    </div>
  );
}
