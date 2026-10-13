import { LoadingIndicator } from '@windmorph/react';

/**
 * Passing `value` (0–1) makes the indicator determinate: a circle morphs into a soft burst
 * as it fills. The box is 48px; `className` (`size-6`, `size-16`…) resizes it and the shape
 * scales with it.
 */
export function LoadingDeterminate() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <LoadingIndicator key={value} value={value} aria-label={`${value * 100}%`} />
        ))}
      </div>
      <div className="flex items-center gap-6">
        {['size-6', 'size-10', 'size-16', 'size-24'].map((size) => (
          <LoadingIndicator
            key={size}
            variant="contained"
            value={0.6}
            className={size}
            aria-label={`60% ${size}`}
          />
        ))}
      </div>
    </div>
  );
}
