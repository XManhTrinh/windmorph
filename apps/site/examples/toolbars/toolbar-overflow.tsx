'use client';

import { FloatingToolbar, IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import {
  ContentCopyIcon,
  DeleteIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  MoreVertIcon,
  ShareIcon,
} from '../../components/icons';

/**
 * When the actions don't all fit, M3 puts the rest in an overflow menu in the trailing
 * slot. A `MenuTrigger` with an icon button does it; reveal more actions in larger windows.
 * The vibrant toolbar recolours its icon buttons: standard ones turn `on-primary-container`
 * and a selected tonal toggle turns `surface-container`.
 */
export function ToolbarOverflow() {
  return (
    <FloatingToolbar
      aria-label="Formatting"
      color="vibrant"
      trailing={
        <MenuTrigger>
          <IconButton icon={<MoreVertIcon />} aria-label="More actions" />
          <Menu aria-label="More actions" placement="top-end">
            <MenuItem key="copy" leadingIcon={<ContentCopyIcon />}>
              Copy
            </MenuItem>
            <MenuItem key="share" leadingIcon={<ShareIcon />}>
              Share
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      }
    >
      <IconButton
        toggle
        variant="tonal"
        defaultSelected
        icon={<FormatBoldIcon />}
        aria-label="Bold"
      />
      <IconButton toggle variant="tonal" icon={<FormatItalicIcon />} aria-label="Italic" />
    </FloatingToolbar>
  );
}
