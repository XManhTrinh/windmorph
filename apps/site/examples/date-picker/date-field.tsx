'use client';

import { CalendarDate } from '@internationalized/date';
import { DateField } from '@windmorph/react';
import { useState } from 'react';

/**
 * The docked date picker: an outlined field you can type a date into (any of dashes,
 * spaces, slashes or dots; it is reformatted when you press Enter or leave), with the
 * locale's format as helper text. The calendar button opens a calendar just below, with
 * month and year menus; OK or Enter on a day saves the date.
 */
export function DateFieldExample() {
  const [value, setValue] = useState<CalendarDate | null>(new CalendarDate(2030, 3, 14));
  return (
    <div className="flex flex-col gap-4">
      <DateField label="Date" value={value} onChange={setValue} yearRange={[2020, 2040]} />
      <p className="text-body-medium text-on-surface-variant">
        Selected: {value?.toString() ?? 'none'}
      </p>
    </div>
  );
}
