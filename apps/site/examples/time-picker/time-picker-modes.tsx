'use client';

import { Time } from '@internationalized/date';
import { TimePicker } from '@windmorph/react';

/**
 * A 24-hour dial (its hours run on an outer and inner ring) and `mode="input"`, which swaps
 * the dial for typed hour and minute fields. Both are uncontrolled here with `defaultValue`.
 */
export function TimePickerModes() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="w-fit rounded-corner-extra-large bg-surface-container-high p-6">
        <TimePicker defaultValue={new Time(18, 0)} hourCycle={24} />
      </div>
      <div className="w-fit rounded-corner-extra-large bg-surface-container-high p-6">
        <TimePicker defaultValue={new Time(9, 5)} hourCycle={12} mode="input" />
      </div>
    </div>
  );
}
