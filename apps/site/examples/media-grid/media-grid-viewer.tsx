'use client';

import { Button } from '@windmorph/react';
import { MediaGrid, MediaViewer } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from '../media-viewer/sample-photos';

const PHOTOS = [...SAMPLE_PHOTOS, ...SAMPLE_PHOTOS].map((photo, index) => ({
  ...photo,
  key: `${photo.key}-${index}`,
}));

/**
 * A profile's photos: pressing one opens the viewer there, growing out of the pressed tile
 * (`onAction` passes it, for the viewer's `origin`), with an action in its top bar.
 */
export function MediaGridViewer() {
  const [open, setOpen] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Element | undefined>();
  return (
    <div className="w-full max-w-sm">
      <MediaGrid
        items={PHOTOS}
        max={6}
        onAction={(index, tile) => {
          setOrigin(tile);
          setOpen(index);
        }}
        aria-label="Photos"
      />
      <MediaViewer
        aria-label="Photos"
        items={PHOTOS}
        open={open !== null}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        index={open ?? 0}
        onIndexChange={setOpen}
        origin={origin}
        actions={
          <Button variant="text" href="#demo-post">
            View post
          </Button>
        }
      />
    </div>
  );
}
