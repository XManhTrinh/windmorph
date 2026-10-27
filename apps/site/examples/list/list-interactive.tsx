'use client';

import { List, ListItem, Switch } from '@windmorph/react';
import { useState } from 'react';
import { DeleteIcon, HomeIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * An interactive list: `onAction` makes it a grid list, so items get state layers and
 * morph their corners. ↑ / ↓ move between items and ← / → reach a trailing control (the
 * switch here). Press or Enter fires `onAction` with the item's `key`.
 */
export function ListInteractive() {
  const [last, setLast] = useState('nothing');
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Mail" variant="segmented" onAction={(key) => setLast(String(key))}>
        <ListItem key="inbox" leading={<HomeIcon />} supportingText="3 new messages">
          Inbox
        </ListItem>
        <ListItem key="starred" leading={<StarIcon />}>
          Starred
        </ListItem>
        <ListItem
          key="sent"
          leading={<SendIcon />}
          trailing={<Switch aria-label="Notify for sent mail" />}
        >
          Sent
        </ListItem>
        <ListItem key="trash" leading={<DeleteIcon />}>
          Trash
        </ListItem>
      </List>
      <p className="px-2 text-body-medium text-on-surface-variant">Opened: {last}</p>
    </div>
  );
}
