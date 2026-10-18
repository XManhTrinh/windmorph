'use client';

import { Time } from '@internationalized/date';
import { TimePicker } from '@windmorph/react';
import { useState } from 'react';

/**
 * The time picker's dial: press or drag to pick the hour, then the minute, or type them into
 * the selectors. Its value is an `@internationalized/date` `Time`; it is controlled here with
 * `value` / `onChange`. `hourCycle={12}` shows an AM / PM selector; leave `hourCycle` off to
 * follow the locale.
 */
export function TimePickerDial() {
  const [value, setValue] = useState(new Time(14, 35));
  return (
    <div className="flex flex-col gap-4">
      <div className="w-fit rounded-corner-extra-large bg-surface-container-high p-6">
        <TimePicker value={value} onChange={setValue} hourCycle={12} />
      </div>
      <p className="text-body-medium text-on-surface-variant">Selected: {value.toString()}</p>
    </div>
  );
}
