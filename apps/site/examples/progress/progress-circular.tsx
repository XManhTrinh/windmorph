import { CircularProgressIndicator } from '@windmorph/react';

/**
 * Circular progress indicators are determinate (`value` 0–1) or indeterminate (no `value`),
 * flat (40px) or `wavy` (48px), and run clockwise from 12 o'clock in every direction.
 * `thickness={8}` is the spec's thick configuration (44px, 52px wavy). Each needs an
 * accessible name.
 */
export function ProgressCircular() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        {[0.25, 0.5, 0.75].map((value) => (
          <CircularProgressIndicator key={value} value={value} aria-label={`${value * 100}%`} />
        ))}
        <CircularProgressIndicator aria-label="Loading" />
      </div>
      <div className="flex items-center gap-6">
        {[0.25, 0.5, 0.75].map((value) => (
          <CircularProgressIndicator
            key={value}
            value={value}
            wavy
            aria-label={`${value * 100}% (wavy)`}
          />
        ))}
        <CircularProgressIndicator wavy aria-label="Loading (wavy)" />
      </div>
      <div className="flex items-center gap-6">
        <CircularProgressIndicator value={0.6} thickness={8} aria-label="60% (thick)" />
        <CircularProgressIndicator value={0.6} wavy thickness={8} aria-label="60% (thick, wavy)" />
        <CircularProgressIndicator thickness={8} aria-label="Loading (thick)" />
      </div>
    </div>
  );
}
