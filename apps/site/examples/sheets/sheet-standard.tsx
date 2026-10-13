'use client';

import { Button, IconButton, SideSheet } from '@windmorph/react';
import { useState } from 'react';
import { CloseIcon } from '../../components/icons';

/**
 * A standard side sheet sits in the layout beside the content instead of over a scrim,
 * opening and closing its width. It is controlled with `open` / `onOpenChange`. Here it
 * lives in a bounded container so the whole demo stays inside the article.
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
      <SideSheet
        variant="standard"
        title="Details"
        open={open}
        onOpenChange={setOpen}
        actions={
          <IconButton icon={<CloseIcon />} aria-label="Close" onPress={() => setOpen(false)} />
        }
      >
        <p className="text-body-medium text-on-surface-variant">
          Supplementary content that sits beside the page.
        </p>
      </SideSheet>
    </div>
  );
}
