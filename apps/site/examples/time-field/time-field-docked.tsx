'use client';

import { TimeField, parseTime, type Time } from '@windmorph/react';
import { useState } from 'react';

/**
 * Docked: on a wide window the clock opens a list of times under the field instead of the
 * dialog, every half hour by default or every `step` minutes, within `min` and `max`.
 */
export function TimeFieldDocked() {
  const [start, setStart] = useState<Time | null>(parseTime('09:00'));
  return (
    <div className="flex w-full max-w-md flex-wrap gap-4">
      <TimeField label="Opens" presentation="docked" value={start} onChange={setStart} />
      <TimeField
        label="Lunch"
        presentation="docked"
        step={15}
        min={parseTime('11:30')}
        max={parseTime('14:00')}
      />
    </div>
  );
}
