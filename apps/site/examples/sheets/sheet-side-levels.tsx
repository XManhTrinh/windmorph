'use client';

import { Button, List, ListItem, SideSheet } from '@windmorph/react';
import { useState } from 'react';

const FILTERS = ['Distance', 'Price', 'Opening hours'];

/**
 * A side sheet with levels: `onBack` shows a back button before the title, so people can
 * move into a region of the sheet and back out. `detached` floats the modal sheet 16px from
 * the window's edges with corners all round.
 */
export function SheetSideLevels() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  return (
    <>
      <Button variant="tonal" onPress={() => setOpen(true)}>
        Filters
      </Button>
      <SideSheet
        detached
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFilter(null);
        }}
        title={filter ?? 'Filters'}
        {...(filter ? { onBack: () => setFilter(null) } : {})}
      >
        {filter ? (
          <p className="text-body-medium text-on-surface-variant">
            Options for {filter.toLowerCase()} go here.
          </p>
        ) : (
          <List aria-label="Filters" onAction={(key) => setFilter(String(key))}>
            {FILTERS.map((name) => (
              <ListItem key={name}>{name}</ListItem>
            ))}
          </List>
        )}
      </SideSheet>
    </>
  );
}
