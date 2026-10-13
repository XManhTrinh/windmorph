'use client';

import { MediaViewer } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from './sample-photos';

/**
 * Thumbnails open the viewer on the photo tapped. Swipe, use the arrow keys or the side
 * buttons to move, double-tap or pinch to zoom, and close with Escape: focus goes back to
 * the thumbnail that opened it.
 */
export function MediaViewerGallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <div className="grid w-full max-w-[360px] grid-cols-2 gap-1">
      {SAMPLE_PHOTOS.map((photo, position) => (
        <button
          key={photo.key}
          type="button"
          aria-label={photo.alt}
          onClick={() => {
            setIndex(position);
            setOpen(true);
          }}
          className="aspect-square cursor-pointer overflow-hidden rounded-corner-small focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <img src={photo.src} alt="" className="size-full object-cover" />
        </button>
      ))}
      <MediaViewer
        aria-label="Photos from Sam's post"
        items={SAMPLE_PHOTOS}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
      />
    </div>
  );
}
