'use client';

import { Checkbox, DENSITIES, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3: each step takes 4px off the round state layer (40px at 0, 28px at -3);
 * the box stays 18px and the touch target 48px. Density is a reader's choice, not a default
 * (M3): set it app-wide on `ThemeProvider` from a setting, or for a section with `ThemeScope`,
 * as here; a checkbox's own `density` prop overrides both.
 */
export function CheckboxDensity() {
  return (
    <div className="grid w-full grid-cols-2 gap-6 medium:grid-cols-4">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col items-start gap-2">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Checkbox defaultChecked>Email</Checkbox>
          <Checkbox>Text message</Checkbox>
        </ThemeScope>
      ))}
    </div>
  );
}
