import { Slider } from '@windmorph/react';

/**
 * Five track sizes, from `xs` (16px) to `xl` (96px). A horizontal slider fills the width
 * of its container, so here they share one width-limited wrapper.
 */
export function SliderSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider aria-label="Extra small" size="xs" defaultValue={40} />
      <Slider aria-label="Small" size="sm" defaultValue={40} />
      <Slider aria-label="Medium" size="md" defaultValue={40} />
      <Slider aria-label="Large" size="lg" defaultValue={40} />
      <Slider aria-label="Extra large" size="xl" defaultValue={40} />
    </div>
  );
}
