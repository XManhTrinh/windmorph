'use client';

import { Button, Menu, MenuItem, MenuTrigger, SubmenuTrigger } from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, ContentCopyIcon, SendIcon } from '../../components/icons';

/**
 * A `SubmenuTrigger` pairs an item with its submenu. The submenu opens beside the item on
 * hover, press, Enter, Space or → (← in right-to-left) and closes with the opposite arrow or
 * Escape. While it's open the item stays pressed and the focused menu is the rounder one.
 */
export function MenuSubmenu() {
  const [last, setLast] = useState('none');
  const run = (key: unknown) => setLast(String(key));
  return (
    <div className="flex flex-col items-start gap-3">
      <MenuTrigger>
        <Button variant="tonal">File</Button>
        <Menu onAction={run}>
          <MenuItem key="new" leadingIcon={<AddIcon />}>
            New
          </MenuItem>
          <MenuItem key="duplicate" leadingIcon={<ContentCopyIcon />}>
            Duplicate
          </MenuItem>
          <SubmenuTrigger>
            <MenuItem key="share" leadingIcon={<SendIcon />}>
              Share
            </MenuItem>
            <Menu aria-label="Share" onAction={run}>
              <MenuItem key="email">Email</MenuItem>
              <MenuItem key="link">Copy link</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
