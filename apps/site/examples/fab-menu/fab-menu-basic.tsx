'use client';

import { FabMenu, FabMenuItem } from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, CloseIcon, DeleteIcon, EditIcon, SendIcon } from '../../components/icons';

/**
 * A FAB menu opens a stack of related actions above the button. It is positioned here at
 * the bottom end of a framed box, the way an app would anchor it with `className`
 * (e.g. `fixed end-4 bottom-4`). Choosing an item runs its `onAction` and closes the menu.
 */
export function FabMenuBasic() {
  const [last, setLast] = useState('none');
  return (
    <div className="relative h-[360px] w-full max-w-[400px] rounded-corner-large bg-surface-container-low">
      <p className="p-4 text-body-medium text-on-surface-variant">Last action: {last}</p>
      <FabMenu
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="Create"
        className="absolute end-4 bottom-4"
      >
        <FabMenuItem icon={<EditIcon />} onAction={() => setLast('Edit')}>
          Edit
        </FabMenuItem>
        <FabMenuItem icon={<SendIcon />} onAction={() => setLast('Send')}>
          Send
        </FabMenuItem>
        <FabMenuItem icon={<DeleteIcon />} onAction={() => setLast('Delete')}>
          Delete
        </FabMenuItem>
      </FabMenu>
    </div>
  );
}
