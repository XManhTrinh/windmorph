'use client';

import { List, ListItem } from '@windmorph/react';
import { useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEMES: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Match my device',
};

function isTheme(value: string): value is Theme {
  return value in THEMES;
}

/**
 * A radio list: with `value` (or `defaultValue`) and `onValueChange` the list is a radio
 * group, each item a radio button with a `value`. One Tab stop; ↑ / ↓ choose.
 */
export function ListRadio() {
  const [theme, setTheme] = useState<Theme>('system');
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3">
      <h3 id="theme-label" className="px-2 text-title-small text-on-surface">
        Theme
      </h3>
      <List
        aria-labelledby="theme-label"
        variant="segmented"
        value={theme}
        onValueChange={(value) => {
          if (isTheme(value)) setTheme(value);
        }}
      >
        {(Object.keys(THEMES) as Theme[]).map((key) => (
          <ListItem key={key} value={key}>
            {THEMES[key]}
          </ListItem>
        ))}
      </List>
    </div>
  );
}
