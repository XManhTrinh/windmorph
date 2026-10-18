'use client';

import { IconButton, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from '../../components/icons';

/** The three-dot "more" affordance (not in the shared icon set). */
function MoreIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
      <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
    </svg>
  );
}

/**
 * A grouped menu opened from an `IconButton`. Items are identified by `key`; `onAction`
 * fires that key on press or Enter. Items take a `leadingIcon`, a `description` and a
 * `shortcut`; `disabledKeys` disables one. Arrow keys move between items and typing jumps
 * to a label (typeahead).
 */
export function MenuBasic() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <MenuTrigger>
        <IconButton variant="standard" icon={<MoreIcon />} aria-label="More actions" />
        <Menu onAction={(key) => setLast(String(key))} disabledKeys={['find']}>
          <MenuGroup title="Edit">
            <MenuItem key="new" leadingIcon={<AddIcon />} shortcut="⌘N">
              New
            </MenuItem>
            <MenuItem key="rename" leadingIcon={<EditIcon />} description="Rename or move">
              Edit
            </MenuItem>
            <MenuItem key="find" leadingIcon={<SearchIcon />} shortcut="⌘F">
              Find
            </MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="Danger zone">
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
