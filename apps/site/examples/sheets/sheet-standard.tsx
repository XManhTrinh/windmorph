'use client';

import { Button, SideSheet } from '@windmorph/react';
import { useState } from 'react';

/**
 * A standard side sheet sits in the layout beside the content instead of over a scrim,
 * opening and closing its width, with a divider on its content edge. It is controlled with
 * `open` / `onOpenChange`; its close button reports `onOpenChange(false)`. Here it lives in
 * a bounded container so the whole demo stays inside the article.
 */
export function SheetStandard() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-[320px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div className="flex flex-1 flex-col items-start gap-4 p-6">
        <p className="text-body-large text-on-surface">Main content</p>
        <Button variant="tonal" onPress={() => setOpen((v) => !v)}>
          {open ? 'Hide details' : 'Show details'}
        </Button>
      </div>
      <SideSheet variant="standard" title="Details" open={open} onOpenChange={setOpen}>
        <p className="text-body-medium text-on-surface-variant">
          Supplementary content that sits beside the page.
        </p>
      </SideSheet>
    </div>
  );
}
