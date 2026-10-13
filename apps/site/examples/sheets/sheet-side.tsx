'use client';

import { Button, IconButton, SheetTrigger, SideSheet } from '@windmorph/react';
import { CloseIcon } from '../../components/icons';

/**
 * A modal side sheet slides in from the end edge over a scrim as a dialog. Its `title`
 * names it; `actions` holds header controls (the library ships no close icon, so add your
 * own). Escape or a press on the scrim closes it.
 */
export function SheetSide() {
  return (
    <SheetTrigger>
      <Button>Open filters</Button>
      <SideSheet
        title="Filters"
        actions={({ close }) => (
          <IconButton icon={<CloseIcon />} aria-label="Close" onPress={close} />
        )}
      >
        <p className="text-body-medium text-on-surface-variant">
          Filter the results by date, type and owner.
        </p>
      </SideSheet>
    </SheetTrigger>
  );
}
