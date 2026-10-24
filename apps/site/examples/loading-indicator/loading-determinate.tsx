import { LoadingIndicator } from '@windmorph/react';

/**
 * Passing `value` (0–1) makes the indicator follow a gesture's progress (pull to refresh): a
 * circle morphs into a soft burst as it fills. Never switch one instance between the two modes.
 * The box is 48px by default; `size` sets it anywhere in the spec's 24–240px range (a `size-*`
 * class works too), and the shape scales with it. Name each for what is loading, not its
 * value, which it announces itself.
 */
export function LoadingDeterminate() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <LoadingIndicator key={value} value={value} aria-label="Refreshing feed" />
        ))}
      </div>
      <div className="flex items-center gap-6">
        {[24, 40, 64, 96].map((size) => (
          <LoadingIndicator
            key={size}
            variant="contained"
            value={0.6}
            size={size}
            aria-label="Uploading photo"
          />
        ))}
      </div>
    </div>
  );
}
