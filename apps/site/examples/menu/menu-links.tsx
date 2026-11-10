'use client';

import { Button, Menu, MenuItem, MenuTrigger } from '@windmorph/react';

/**
 * Items with `href` are real links with the look and keys of any item: a press, Enter or
 * Space follows one and closes the menu, and a modified click or the browser's link menu
 * opens it in a new tab or copies its address. `download` saves the file instead. Inside a
 * `RouterProvider` (`NextRouterProvider` in Next.js), a plain click goes through the router.
 */
export function MenuLinks() {
  return (
    <MenuTrigger>
      <Button variant="tonal">Resources</Button>
      <Menu aria-label="Resources">
        <MenuItem key="start" href="/getting-started">
          Getting started
        </MenuItem>
        <MenuItem key="theming" href="/theming">
          Theming
        </MenuItem>
        <MenuItem key="icon" href="/windmorph-icon.png" download="windmorph-icon.png">
          Download the icon
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
