'use client';

import { TimeField } from '@windmorph/react';

/** It takes what people type: 9, 930, 9:30, 9.30, 9pm. The clock opens the picker. */
export function TimeFieldFormats() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <TimeField label="Start" />
      <TimeField label="End" variant="filled" hourCycle={24} />
    </div>
  );
}
