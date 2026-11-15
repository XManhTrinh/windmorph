'use client';

import { MediaGrid } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from '../media-viewer/sample-photos';

/** An address that gives no picture, as a photo whose file is gone or whose host is down. */
const NO_PICTURE = 'data:image/png;base64,AAAA';

const PHOTOS = SAMPLE_PHOTOS.map((photo, index) =>
  index === 1 ? { ...photo, src: NO_PICTURE } : photo,
);

/**
 * A photo that can't be loaded keeps its tile: a square in a container colour with an icon in
 * place of the photo (`fallbackIcon`). It is still a button named by the photo's `alt` and
 * still reports its press, so an app can open the viewer or offer another try.
 */
export function MediaGridFailed() {
  const [pressed, setPressed] = useState<number | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MediaGrid items={PHOTOS} columns={4} onAction={setPressed} aria-label="Trip photos" />
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {pressed === null ? 'No photo pressed yet' : `Pressed photo ${pressed + 1}`}
      </p>
    </div>
  );
}
