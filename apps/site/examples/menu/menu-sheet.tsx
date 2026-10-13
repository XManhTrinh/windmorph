'use client';

import { Button, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';
import { useState } from 'react';
import { ContentCopyIcon, DeleteIcon, EditIcon, ShareIcon } from '../../components/icons';

/**
 * `presentation="auto"` keeps the menu anchored to its button on larger windows and opens
 * it in a bottom sheet on phones (below 600px wide), where a sheet is easier to reach with
 * a thumb. The menu inside keeps its keyboard, typeahead and focus; the sheet is a dialog
 * named like the menu. `presentation="sheet"` always uses the sheet.
 */
export function MenuSheet() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <MenuTrigger>
        <Button variant="tonal">Photo options</Button>
        <Menu presentation="auto" onAction={(key) => setLast(String(key))}>
          <MenuGroup aria-label="Share">
            <MenuItem key="share" leadingIcon={<ShareIcon />}>
              Share
            </MenuItem>
            <MenuItem key="copy" leadingIcon={<ContentCopyIcon />}>
              Copy link
            </MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="Edit">
            <MenuItem key="rename" leadingIcon={<EditIcon />}>
              Rename
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
