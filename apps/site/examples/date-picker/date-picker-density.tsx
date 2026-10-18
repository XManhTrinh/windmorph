'use client';

import { CalendarDate } from '@internationalized/date';
import { DENSITIES, DateField, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3: the typed date field loses 4px a step (56px at 0, 44px at -3), as do
 * the modal picker's input mode fields. The calendar keeps its size: M3 doesn't make date
 * pickers denser, since their 48px days are part of their accessibility.
 */
export function DatePickerDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <DateField
            label="Date"
            defaultValue={new CalendarDate(2030, 3, 14)}
            yearRange={[2020, 2040]}
            className="w-full"
          />
        </ThemeScope>
      ))}
    </div>
  );
}
