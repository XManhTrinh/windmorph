import { Slider } from '@windmorph/react';

/**
 * A discrete slider: a coarse `step` with `ticks` draws a stop indicator at every step.
 * `centered` fills the track outward from its midpoint instead of from the start.
 */
export function SliderDiscrete() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider aria-label="Rating" size="md" min={0} max={5} step={1} ticks defaultValue={3} />
      <Slider aria-label="Balance" size="md" centered defaultValue={50} />
    </div>
  );
}
