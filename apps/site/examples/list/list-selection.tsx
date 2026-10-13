'use client';

import { List, ListItem } from '@windmorph/react';
import { useState } from 'react';

/**
 * Selection lists: with `selectionMode` the list is a list box, and selected items take the
 * highlighted colour, their selected shape and a check, so selection never relies on colour
 * alone. A standard (flush) list chooses one item here, a segmented one several.
 */
export function ListSelection() {
  const [size, setSize] = useState<Set<string | number> | 'all'>(new Set(['medium']));
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <div className="w-full max-w-xs rounded-corner-extra-large bg-surface-container-low py-2">
        <List
          aria-label="Bowl size"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={size}
          onSelectionChange={setSize}
        >
          <ListItem key="small" supportingText="350 ml">
            Small
          </ListItem>
          <ListItem key="medium" supportingText="500 ml">
            Medium
          </ListItem>
          <ListItem key="large" supportingText="750 ml">
            Large
          </ListItem>
        </List>
      </div>
      <div className="w-full max-w-xs rounded-corner-extra-large bg-surface-container p-3">
        <List
          aria-label="Toppings"
          variant="segmented"
          selectionMode="multiple"
          defaultSelectedKeys={['herbs', 'lime']}
        >
          <ListItem key="herbs">Fresh herbs</ListItem>
          <ListItem key="lime">Lime</ListItem>
          <ListItem key="chilli">Chilli</ListItem>
          <ListItem key="sprouts">Bean sprouts</ListItem>
        </List>
      </div>
    </div>
  );
}
