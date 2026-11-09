'use client';

import { TimeField, parseTime, type Time } from '@windmorph/react';
import { useState } from 'react';

/** Controlled, with limits: text out of range stays as typed, with an inline error. */
export function TimeFieldSchedule() {
  const [start, setStart] = useState<Time | null>(parseTime('09:00'));
  return (
    <div className="flex w-full max-w-md flex-wrap gap-4">
      <TimeField
        label="Opens"
        value={start}
        onChange={setStart}
        min={parseTime('06:00')}
        max={parseTime('12:00')}
      />
      <TimeField label="Closes" defaultValue={parseTime('17:30')} min={start ?? undefined} />
    </div>
  );
}
