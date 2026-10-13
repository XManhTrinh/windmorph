'use client';

import { Card, ContextMenuTrigger, Menu, MenuItem } from '@windmorph/react';
import { useState } from 'react';
import { DeleteIcon, EditIcon, StarIcon } from '../../components/icons';

/**
 * A context menu: a secondary click (right-click or a two-finger tap), Shift + F10 or a
 * long press on a touch screen opens it at the pointer. Name the menu with `aria-label`.
 */
export function MenuContext() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <ContextMenuTrigger>
        <Card variant="outlined" className="w-full max-w-[320px] p-4">
          <p className="text-body-large text-on-surface">Right-click this card</p>
        </Card>
        <Menu aria-label="Card actions" onAction={(key) => setLast(String(key))}>
          <MenuItem key="edit" leadingIcon={<EditIcon />}>
            Edit
          </MenuItem>
          <MenuItem key="favourite" leadingIcon={<StarIcon />}>
            Favourite
          </MenuItem>
          <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
            Delete
          </MenuItem>
        </Menu>
      </ContextMenuTrigger>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
