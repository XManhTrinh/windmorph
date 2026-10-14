'use client';

import { Snackbar } from '@windmorph/react';

/**
 * Longer messages wrap to two lines. With a short action the action stays beside the text;
 * a longer action label moves to its own line under it with `actionOnNewLine`. Keep a
 * snackbar's text to two lines at most.
 */
export function SnackbarTwoLines() {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-4">
      <Snackbar>
        Your grocery order is on its way and should arrive in about twenty minutes
      </Snackbar>
      <Snackbar actionLabel="Retry" onAction={() => {}}>
        Couldn’t upload 3 photos because the connection dropped
      </Snackbar>
      <Snackbar actionLabel="View the order" actionOnNewLine onAction={() => {}}>
        Your food order is on its way and should arrive in about twenty minutes
      </Snackbar>
    </div>
  );
}
