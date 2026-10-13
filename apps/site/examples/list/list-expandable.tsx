'use client';

import { List, ListItem } from '@windmorph/react';
import { HomeIcon, StarIcon } from '../../components/icons';

/**
 * Items with `childItems` expand and collapse to show their nested items, in a
 * folder-like way. Pressing the item or its chevron toggles it, and → / ← expand and
 * collapse it from the keyboard. Nested items are indented 16dp per level.
 */
export function ListExpandable() {
  return (
    <List aria-label="Folders" variant="segmented" defaultExpandedKeys={['photos']}>
      <ListItem
        key="photos"
        leading={<StarIcon />}
        supportingText="2 albums"
        childItems={[
          <ListItem key="trips">Trips</ListItem>,
          <ListItem key="family">Family</ListItem>,
        ]}
      >
        Photos
      </ListItem>
      <ListItem key="music" leading={<HomeIcon />}>
        Music
      </ListItem>
    </List>
  );
}
