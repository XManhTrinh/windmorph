import { Slider } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/**
 * `showValueLabel` shows a value pill above the thumb while it is dragged or
 * keyboard-focused, and `formatOptions` formats that value (and the screen-reader
 * announcement). A `startIcon` sits inside the active track on sizes md and up.
 */
export function SliderValueLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider
        aria-label="Volume"
        size="lg"
        defaultValue={60}
        showValueLabel
        startIcon={<SearchIcon />}
      />
      <Slider
        aria-label="Brightness"
        size="md"
        defaultValue={40}
        showValueLabel
        // 0–100 with a % sign: `style: 'percent'` would read 40 as 4,000%.
        formatOptions={{ style: 'unit', unit: 'percent' }}
      />
    </div>
  );
}
