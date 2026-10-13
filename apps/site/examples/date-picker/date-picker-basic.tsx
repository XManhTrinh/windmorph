'use client';

import { CalendarDate } from '@internationalized/date';
import { DatePicker } from '@windmorph/react';
import { useState } from 'react';

/**
 * The date picker content: a header with the selected date, a month grid with month
 * navigation and a year list, and a text input mode behind the edit toggle. Values are
 * `@internationalized/date` `CalendarDate`s; it is controlled here with `value` / `onChange`
 * (omit `value` and pass `defaultValue` for uncontrolled). Drop it into a `PickerDialog` for
 * the modal form.
 */
export function DatePickerBasic() {
  const [value, setValue] = useState<CalendarDate | null>(new CalendarDate(2030, 3, 14));
  return (
    <div className="flex flex-col gap-4">
      <div className="w-fit rounded-corner-extra-large bg-surface-container-high">
        <DatePicker value={value} onChange={setValue} yearRange={[2020, 2040]} />
      </div>
      <p className="text-body-medium text-on-surface-variant">Selected: {value?.toString()}</p>
    </div>
  );
}
