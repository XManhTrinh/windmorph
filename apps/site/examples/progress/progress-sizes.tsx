import { CircularProgressIndicator } from '@windmorph/react';

/**
 * `size` sets a circular indicator's diameter, from 24px (beside a line of text) to 240px (a
 * full-page wait); values outside the spec's range are clamped. The strokes keep their
 * `thickness`, and a wavy ring gets more waves of the same length as it grows.
 */
export function ProgressSizes() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3 text-body-medium text-on-surface">
        <CircularProgressIndicator size={24} aria-label="Syncing contacts" />
        Syncing contacts
      </div>
      <CircularProgressIndicator value={0.45} size={64} aria-label="Photo upload" />
      <CircularProgressIndicator
        value={0.7}
        wavy
        size={160}
        aria-label="Backing up Zoë’s library"
      />
    </div>
  );
}
