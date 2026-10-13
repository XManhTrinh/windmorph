import { LinearProgressIndicator } from '@windmorph/react';

/**
 * Linear progress indicators: determinate (`value` 0–1) and indeterminate (no `value`),
 * each flat or `wavy`. A determinate track draws a stop dot at the end. They are 240px wide
 * by default; `className="w-full"` stretches them. Each needs an accessible name.
 */
export function ProgressLinear() {
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-6">
      <LinearProgressIndicator value={0.4} aria-label="Uploading" className="w-full" />
      <LinearProgressIndicator value={0.4} wavy aria-label="Uploading (wavy)" className="w-full" />
      <LinearProgressIndicator aria-label="Loading" className="w-full" />
      <LinearProgressIndicator wavy aria-label="Loading (wavy)" className="w-full" />
    </div>
  );
}
