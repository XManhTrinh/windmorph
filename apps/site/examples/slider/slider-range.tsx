import { RangeSlider } from '@windmorph/react';

/**
 * `RangeSlider` selects a range with two thumbs. `labels` names each thumb for
 * assistive tech (`start` and `end`, defaulting to "Minimum" / "Maximum").
 */
export function SliderRange() {
  return (
    <div className="w-full max-w-sm">
      <RangeSlider
        aria-label="Price range"
        size="md"
        defaultValue={[20, 80]}
        labels={{ start: 'Lowest price', end: 'Highest price' }}
      />
    </div>
  );
}
