import { RangeSlider, Slider } from '@windmorph/react';

/**
 * `orientation="vertical"` stands a slider up: it runs bottom to top and is 240px tall
 * unless its container sets a height. Every size and variant works vertically; M3 advises
 * against vertical range sliders, so this one is horizontal beside them.
 */
export function SliderVertical() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Slider aria-label="Bass" orientation="vertical" size="sm" defaultValue={30} />
      <Slider aria-label="Treble" orientation="vertical" size="md" centered defaultValue={60} />
      <Slider
        aria-label="Level"
        orientation="vertical"
        size="lg"
        minValue={0}
        maxValue={10}
        step={1}
        ticks
        defaultValue={7}
      />
      <div className="w-60">
        <RangeSlider aria-label="Opening hours" minValue={6} maxValue={23} defaultValue={[9, 17]} />
      </div>
    </div>
  );
}
