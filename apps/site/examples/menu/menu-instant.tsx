'use client';

import { Button, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { useState } from 'react';

const MENUS = {
  File: ['New', 'Open…', 'Save', 'Export'],
  Edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'],
  View: ['Zoom in', 'Zoom out', 'Full screen'],
} as const;

/**
 * A dense desktop menu bar: `instant` opens and closes each menu with no motion, and
 * `density={-2}` takes 8px off each item. Use it where people move quickly between many
 * menus; keep the default motion elsewhere.
 */
export function MenuInstant() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex gap-1">
        {Object.entries(MENUS).map(([title, items]) => (
          <MenuTrigger key={title}>
            <Button variant="text" size="xs">
              {title}
            </Button>
            <Menu instant density={-2} onAction={(key) => setLast(String(key))}>
              {items.map((item) => (
                <MenuItem key={item}>{item}</MenuItem>
              ))}
            </Menu>
          </MenuTrigger>
        ))}
      </div>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
