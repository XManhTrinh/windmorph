'use client';

import { IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { useFileTrigger } from '@windmorph/react-pro';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

/** A menu item can't be wrapped, so `useFileTrigger` opens the picker from its action. */
export function FileTriggerMenu() {
  const [chosen, setChosen] = useState('');
  const picker = useFileTrigger({
    accept: ['image/*'],
    onSelect: (files) => setChosen(files[0]?.name ?? ''),
  });
  return (
    <div className="flex items-center gap-3">
      <MenuTrigger>
        <IconButton variant="tonal" icon={<EditIcon />} aria-label="Change cover photo" />
        <Menu
          aria-label="Change cover photo"
          onAction={(key) => (key === 'upload' ? picker.open() : setChosen(''))}
        >
          <MenuItem key="upload">Upload photo</MenuItem>
          <MenuItem key="remove">Remove photo</MenuItem>
        </Menu>
      </MenuTrigger>
      {picker.input}
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {chosen ? `Chosen: ${chosen}` : 'No cover photo.'}
      </p>
    </div>
  );
}
