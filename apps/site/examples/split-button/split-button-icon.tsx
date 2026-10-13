'use client';

import { Menu, MenuItem, SplitButton } from '@windmorph/react';
import { AddIcon } from '../../components/icons';

/**
 * The leading button can show just an icon; `leadingLabel` then names it. The menu opens
 * 4px below, lined up with the trailing button's end edge.
 */
export function SplitButtonIcon() {
  return (
    <SplitButton
      variant="tonal"
      leadingIcon={<AddIcon />}
      leadingLabel="New document"
      menuLabel="More ways to create"
      menu={
        <Menu>
          <MenuItem key="template">From a template</MenuItem>
          <MenuItem key="upload">Upload a file</MenuItem>
        </Menu>
      }
    />
  );
}
