'use client';

import { DENSITIES, Radio, RadioGroup, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3: each step takes 4px off the options' state layers (40px at 0, 28px at
 * -3) and puts 2px more between them, so each option keeps a 48px touch target that never
 * reaches the next. Density is a reader's choice, not a default (M3): set it on
 * `ThemeProvider` from a setting, or for a section with `ThemeScope`, as here.
 */
export function RadioGroupDensity() {
  return (
    <div className="grid w-full grid-cols-2 gap-6 medium:grid-cols-4">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density}>
          <RadioGroup label={`Density ${density}`} defaultValue="standard">
            <Radio value="standard">Standard</Radio>
            <Radio value="express">Express</Radio>
            <Radio value="pickup">Pick up</Radio>
          </RadioGroup>
        </ThemeScope>
      ))}
    </div>
  );
}
