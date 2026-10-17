'use client';

import { FabMenu, FabMenuItem } from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, CloseIcon, DeleteIcon, EditIcon, SendIcon } from '../../components/icons';

/**
 * On the web and in large windows, `presentation="menu"` opens a standard menu 4px above
 * the FAB, with menu semantics and keyboard support (arrows, typeahead, Escape). Larger
 * windows use larger FABs and 24px margins (`end-6 bottom-6`).
 */
export function FabMenuWeb() {
  const [last, setLast] = useState('none');
  return (
    <div className="relative h-[360px] w-full max-w-[480px] rounded-corner-large bg-surface-container-low">
      <p className="p-4 text-body-medium text-on-surface-variant">Last action: {last}</p>
      <FabMenu
        presentation="menu"
        size="lg"
        icon={<AddIcon />}
        openIcon={<CloseIcon />}
        aria-label="Create"
        className="absolute end-6 bottom-6"
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
