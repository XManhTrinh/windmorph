'use client';

import { Button, SheetTrigger, SideSheet } from '@windmorph/react';

/**
 * A modal side sheet slides in from the end edge over a scrim as a dialog. Its `title`
 * names it, and it always shows a close button, as M3 requires (`labels.close` names it).
 * `footer` holds the bottom actions, here under a divider. Escape or a press on the scrim
 * also closes it.
 */
export function SheetSide() {
  return (
    <SheetTrigger>
      <Button>Open filters</Button>
      <SideSheet
        title="Filters"
        footerDivider
        footer={({ close }) => (
          <>
            <Button onPress={close}>Apply</Button>
            <Button variant="outlined" onPress={close}>
              Cancel
            </Button>
          </>
        )}
      >
        <p className="text-body-medium text-on-surface-variant">
          Filter the results by date, type and owner.
        </p>
      </SideSheet>
    </SheetTrigger>
  );
}
