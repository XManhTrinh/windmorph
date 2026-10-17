import { LoadingIndicator } from '@windmorph/react';

/**
 * The loading indicator is indeterminate by default: a shape morphs through Material shapes
 * while it rotates. `variant="contained"` draws it on a `primary-container` circle. It is a
 * `role="progressbar"`, so it needs an accessible name.
 */
export function LoadingIndeterminate() {
  return (
    <div className="flex items-center gap-8">
      <LoadingIndicator aria-label="Loading" />
      <LoadingIndicator variant="contained" aria-label="Loading" />
    </div>
  );
}
