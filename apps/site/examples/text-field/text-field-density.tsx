'use client';

import { DENSITIES, TextField, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3: each step takes 4px off the field (56px at 0, 44px at -3). Density is
 * a reader's choice, not a default (M3): set it app-wide on `ThemeProvider` from a setting, or
 * for a section with `ThemeScope`, as here; a field's own `density` prop overrides both.
 */
export function TextFieldDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <TextField label="Name" defaultValue="Priya Shah" className="w-full" />
          <TextField variant="outlined" label="Email" className="w-full" />
        </ThemeScope>
      ))}
    </div>
  );
}
