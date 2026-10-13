import { RangeSlider } from '@windmorph/react';

/**
 * `RangeSlider` selects a range with two thumbs. `thumbLabels` names each thumb for
 * assistive tech (defaulting to "Minimum" / "Maximum").
 */
export function SliderRange() {
  return (
    <div className="w-full max-w-sm">
      <RangeSlider
        aria-label="Price range"
        size="md"
        defaultValue={[20, 80]}
        thumbLabels={['Lowest price', 'Highest price']}
      />
    </div>
  );
}
