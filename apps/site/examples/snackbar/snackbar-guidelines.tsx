import { Snackbar } from '@windmorph/react';

function noop() {}

/** Do: one snackbar at a time, with Undo so the choice can be changed. */
export function SnackbarDoUndo() {
  return (
    <div className="w-full max-w-80">
      <Snackbar actionLabel="Undo" onAction={noop}>
        Message archived
      </Snackbar>
    </div>
  );
}

/** Don't: snackbars stacked on top of one another. */
export function SnackbarDontStacked() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-2">
      <Snackbar>Photo saved</Snackbar>
      <Snackbar actionLabel="Undo" onAction={noop}>
        Message archived
      </Snackbar>
      <Snackbar>2 photos uploaded</Snackbar>
    </div>
  );
}
