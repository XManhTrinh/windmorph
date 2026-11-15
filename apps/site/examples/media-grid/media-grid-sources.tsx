'use client';

import { MediaGrid } from '@windmorph/react-pro';
import { useState } from 'react';

/** The widths one photo is stored at (`public/media/photos`); each file has its width on it. */
const WIDTHS = [160, 320, 640, 1280];

/** Each tile's files have an address of their own, as each photo of a real gallery has. */
const fileAt = (width: number, tile: number) => `/media/photos/sample-${width}.svg?tile=${tile}`;

const PHOTOS = Array.from({ length: 6 }, (_, index) => ({
  key: `photo-${index}`,
  alt: `Photo ${index + 1}`,
  src: fileAt(640, index),
  srcSet: WIDTHS.map((width) => `${fileAt(width, index)} ${width}w`).join(', '),
}));

/**
 * Photos stored at several widths: pass them as `srcSet` and each tile loads the smallest
 * file that fills it, here the one whose width it shows. The grid tells the browser how wide
 * a tile is (`sizes`) from its own layout, as a share of the window. This grid sits in a
 * column narrower than the window, a width set in CSS, so it passes its own: the tile's
 * laid-out width where the browser reads it (`auto`), else a third of the 576px column.
 */
export function MediaGridSources() {
  const [pressed, setPressed] = useState<number | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MediaGrid
        items={PHOTOS}
        sizes="auto, (min-width: 600px) 190px, 112px"
        onAction={setPressed}
        aria-label="Photos at several widths"
      />
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {pressed === null ? 'No photo pressed yet' : `Pressed photo ${pressed + 1}`}
      </p>
    </div>
  );
}
