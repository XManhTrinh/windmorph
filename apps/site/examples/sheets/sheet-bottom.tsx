'use client';

import { BottomSheet, Button, List, ListItem, SheetTrigger } from '@windmorph/react';
import { DeleteIcon, EditIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A modal bottom sheet opened from a `SheetTrigger`. It slides up over a scrim; a short
 * sheet opens fully. Drag the handle down, press it, press the scrim or press Escape to
 * close. A name is required (`aria-label` here). `children` may be `({ close }) => …`.
 */
export function SheetBottom() {
  const options = [
    { key: 'share', icon: <SendIcon />, label: 'Share' },
    { key: 'favourite', icon: <StarIcon />, label: 'Add to favourites' },
    { key: 'edit', icon: <EditIcon />, label: 'Edit' },
    { key: 'delete', icon: <DeleteIcon />, label: 'Delete' },
  ];
  return (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <BottomSheet aria-label="Options">
        {({ close }) => (
          <div className="pb-6">
            <List aria-label="Options" onAction={close}>
              {options.map(({ key, icon, label }) => (
                <ListItem key={key} leading={icon}>
                  {label}
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </BottomSheet>
    </SheetTrigger>
  );
}
