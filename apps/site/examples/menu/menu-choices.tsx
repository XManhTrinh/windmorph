'use client';

import { Button, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';
import { useState } from 'react';

/**
 * A group of choices beside plain actions: the `MenuGroup` takes the selection, so its items
 * are radio items with the current account checked, while "Add an account" and "Settings"
 * stay actions that close the menu without selecting anything.
 */
export function MenuChoices() {
  const [account, setAccount] = useState(new Set(['alex']));
  return (
    <MenuTrigger>
      <Button variant="tonal">Account</Button>
      <Menu aria-label="Account">
        <MenuGroup
          title="Signed in as"
          selectionMode="single"
          deselectable={false}
          selectedKeys={account}
          onSelectionChange={(keys) => setAccount(new Set([...(keys as Set<string>)]))}
        >
          <MenuItem key="alex">Alex Morgan</MenuItem>
          <MenuItem key="studio">Morgan Studio</MenuItem>
        </MenuGroup>
        <MenuGroup aria-label="Accounts">
          <MenuItem key="add">Add an account</MenuItem>
          <MenuItem key="settings">Settings</MenuItem>
        </MenuGroup>
      </Menu>
    </MenuTrigger>
  );
}
