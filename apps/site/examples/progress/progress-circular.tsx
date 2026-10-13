import { CircularProgressIndicator } from '@windmorph/react';

/**
 * Circular progress indicators are determinate only: `value` (0–1) is required. There is no
 * indeterminate circular indicator in M3 Expressive — use `LoadingIndicator` for that. They
 * are flat (40px) or `wavy` (48px) and need an accessible name.
 */
export function ProgressCircular() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        {[0.25, 0.5, 0.75, 1].map((value) => (
          <CircularProgressIndicator key={value} value={value} aria-label={`${value * 100}%`} />
        ))}
      </div>
      <div className="flex items-center gap-6">
        {[0.25, 0.5, 0.75, 1].map((value) => (
          <CircularProgressIndicator
            key={value}
            value={value}
            wavy
            aria-label={`${value * 100}% (wavy)`}
          />
        ))}
      </div>
    </div>
  );
}
