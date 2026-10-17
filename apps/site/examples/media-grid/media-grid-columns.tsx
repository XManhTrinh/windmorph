'use client';

import { MediaGrid } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from '../media-viewer/sample-photos';

const PHOTOS = [...SAMPLE_PHOTOS, ...SAMPLE_PHOTOS].map((photo, index) => ({
  ...photo,
  key: `${photo.key}-${index}`,
}));

/**
 * A listing's gallery: every photo, in four columns from medium windows up (`columns`), and a
 * row that scrolls sideways on phones.
 */
export function MediaGridColumns() {
  const [pressed, setPressed] = useState<number | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MediaGrid items={PHOTOS} columns={4} onAction={setPressed} aria-label="Listing photos" />
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {pressed === null ? 'No photo pressed yet' : `Pressed photo ${pressed + 1}`}
      </p>
    </div>
  );
}
