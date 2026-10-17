'use client';

import { Button, Carousel } from '@windmorph/react';
import { useState } from 'react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

const ALBUMS = ['Coast', 'Mountains', 'City', 'Forest', 'Desert', 'Lakes', 'Islands', 'Snow'];

/**
 * With `onAction`, items show hover, focus and pressed states (their corners tighten) and
 * open on a press, Enter or Space. Tab or the arrow keys move between items; Up and Down
 * leave the carousel, here for the "Show all" button the spec asks for below a carousel.
 * `labels.slide` localises each item's "n of N" name.
 */
export function CarouselActions() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="flex w-full flex-col gap-2">
      <Carousel
        aria-label="Albums"
        className="h-[200px]"
        onAction={(index) => setOpened(ALBUMS[index]!)}
        labels={{ slide: (position, count) => `Album ${position} of ${count}` }}
      >
        {ALBUMS.map((album, index) => (
          <div
            key={album}
            className={`flex size-full items-end p-4 text-title-medium ${TONES[index % TONES.length]}`}
          >
            {album}
          </div>
        ))}
      </Carousel>
      <p className="text-body-medium text-on-surface-variant">
        {opened === null ? 'Choose an album.' : `Opened ${opened}.`}
      </p>
      <Button variant="text" className="self-start">
        Show all
      </Button>
    </div>
  );
}
