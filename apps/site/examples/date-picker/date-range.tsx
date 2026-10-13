'use client';

import { CalendarDate } from '@internationalized/date';
import { DateRangePicker, type DateRange } from '@windmorph/react';
import { useState } from 'react';

/**
 * The date range picker: pick a start and an end date on the month grid, or type them in
 * input mode. Its value is a `{ start, end }` pair of `CalendarDate`s; the days between the
 * ends sit on a `secondary-container` band.
 */
export function DateRangeExample() {
  const [value, setValue] = useState<DateRange | null>({
    start: new CalendarDate(2030, 3, 10),
    end: new CalendarDate(2030, 3, 13),
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="w-fit rounded-corner-extra-large bg-surface-container-high">
        <DateRangePicker value={value} onChange={setValue} yearRange={[2020, 2040]} />
      </div>
      <p className="text-body-medium text-on-surface-variant">
        Selected: {value ? `${value.start.toString()} – ${value.end.toString()}` : 'none'}
      </p>
    </div>
  );
}
