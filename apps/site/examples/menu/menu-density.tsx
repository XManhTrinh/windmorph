'use client';

import { Button, DENSITIES, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';

/**
 * Web density, 0 to -3 (M3: "On web only"): each step takes 4px off the items (44px at 0, 32px
 * at -3) and 2px off the space around dividers. Here each menu sets `density`; in an app, set it
 * once on `ThemeProvider` from a setting, since M3 makes density the reader's choice.
 */
export function MenuDensity() {
  return (
    <div className="flex flex-wrap gap-3">
      {DENSITIES.map((density) => (
        <MenuTrigger key={density}>
          <Button variant="outlined">{`Density ${density}`}</Button>
          <Menu aria-label={`Density ${density}`} density={density}>
            <MenuGroup aria-label="Edit">
              <MenuItem key="cut">Cut</MenuItem>
              <MenuItem key="copy">Copy</MenuItem>
              <MenuItem key="paste">Paste</MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="More">
              <MenuItem key="delete">Delete</MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
      ))}
    </div>
  );
}
