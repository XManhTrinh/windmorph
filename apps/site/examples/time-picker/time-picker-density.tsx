'use client';

import { Time } from '@internationalized/date';
import { DENSITIES, ThemeScope, TimePicker } from '@windmorph/react';

/**
 * Web density, 0 to -3: the input mode's hour and minute fields lose 4px a step (72px at 0, 60px
 * at -3). The dial keeps its size: M3 doesn't make time pickers denser, since its 48px numbers
 * are part of their accessibility.
 */
export function TimePickerDensity() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col gap-3">
          <p className="text-title-small">{`Density ${density}`}</p>
          <div className="w-fit max-w-full rounded-corner-extra-large bg-surface-container-high p-6">
            <TimePicker defaultValue={new Time(9, 5)} hourCycle={12} mode="input" />
          </div>
        </ThemeScope>
      ))}
    </div>
  );
}
