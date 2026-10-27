'use client';

import { DENSITIES, Switch, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3, only shrinks a switch's state layer (40px at 0, 32px at -2 and -3);
 * the 52 × 32px track and the 48px touch target stay, so dense switches line up with dense
 * checkboxes and lists. Set density on `ThemeProvider` from a setting, or for a section with
 * `ThemeScope`, as here.
 */
export function SwitchDensity() {
  return (
    <div className="grid w-full grid-cols-2 gap-6 medium:grid-cols-4">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col items-start gap-3">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Switch defaultChecked>Wi-Fi</Switch>
          <Switch>Bluetooth</Switch>
        </ThemeScope>
      ))}
    </div>
  );
}
