import { Slider } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

const minutes = new Intl.NumberFormat('en', { style: 'unit', unit: 'minute', unitDisplay: 'long' });
const seconds = new Intl.NumberFormat('en', { style: 'unit', unit: 'second', unitDisplay: 'long' });

/** A position in a 10-minute recording, in words: "1 minute 25 seconds of 10 minutes". */
const position = (value: number) =>
  `${minutes.format(Math.floor(value / 60))} ${seconds.format(value % 60)} of 10 minutes`;

/**
 * `valueLabel` shows a value pill above the thumb while it is dragged or
 * keyboard-focused, and `formatOptions` formats that value (and the screen-reader
 * announcement). A `leadingIcon` sits inside the active track on sizes md and up.
 * `valueText` puts the value in words for screen readers where a number format can't, such
 * as a time; the pill keeps the number.
 */
export function SliderValueLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider
        aria-label="Volume"
        size="lg"
        defaultValue={60}
        valueLabel
        leadingIcon={<SearchIcon />}
      />
      <Slider
        aria-label="Brightness"
        size="md"
        defaultValue={40}
        valueLabel
        // 0–100 with a % sign: `style: 'percent'` would read 40 as 4,000%.
        formatOptions={{ style: 'unit', unit: 'percent' }}
      />
      <Slider aria-label="Position" max={600} step={5} defaultValue={85} valueText={position} />
    </div>
  );
}
