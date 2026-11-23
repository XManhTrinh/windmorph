'use client';

import { SegmentedBar, SegmentedList } from '@windmorph/react-pro/charts';

const ANSWERS = [
  { key: 'never', label: 'Never', value: 120 },
  { key: 'rarely', label: 'Rarely', value: 210 },
  { key: 'sometimes', label: 'Sometimes', value: 340 },
  { key: 'often', label: 'Often', value: 260 },
  { key: 'always', label: 'Always', value: 90 },
];

const AGES = [
  { key: 'under-25', label: 'Under 25', value: 1240 },
  { key: '25-44', label: '25 to 44', value: 3310 },
  { key: '45-plus', label: '45 and over', value: 1870 },
];

/**
 * Answers to "How often do you cycle to work?" have an order, so `ordered` draws them in one hue,
 * from the lightest step of the theme's ramp to the darkest (the reverse in dark mode). Three
 * age bands take the ramp's first, middle and last steps. Up to five ordered parts are drawn.
 */
export function SegmentedBarOrdered() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <SegmentedBar aria-label="How often people cycle to work" parts={ANSWERS} ordered />
      <SegmentedList aria-label="Visitors by age" parts={AGES} ordered className="max-w-xs" />
    </div>
  );
}
