'use client';

import { VideoPlayer } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * Each optional control shows once you ask for it: captions with `captions` (and C), Next with
 * `onNext` (and Shift+N), Rotate with `rotatable` (and R), Autoplay with
 * `onAutoplayNextChange`, Theater with `onTheaterChange` (and T). The player holds theater's
 * state and reports it; the page's layout is yours, here a wider frame. `chapters` split the
 * scrubber.
 */
export function VideoPlayerControls() {
  const [theater, setTheater] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [played, setPlayed] = useState(0);
  return (
    <div className="flex w-full flex-col gap-2">
      <VideoPlayer
        aria-label="A tour of the components"
        source="/media/bento/bento-dark.mp4"
        poster={{ src: '/media/bento/bento-dark.jpg' }}
        width={1152}
        height={720}
        duration={18}
        captions={[
          { lang: 'en', src: '/media/captions/tour-en.vtt' },
          { lang: 'fr', src: '/media/captions/tour-fr.vtt' },
        ]}
        chapters={[
          { start: 0, title: 'Themes' },
          { start: 6, title: 'Motion' },
          { start: 12, title: 'Your own' },
        ]}
        onNext={() => setPlayed((count) => count + 1)}
        rotatable
        autoplayNext={autoplay}
        onAutoplayNextChange={setAutoplay}
        theater={theater}
        onTheaterChange={setTheater}
        theaterFrom="medium"
        className={`aspect-[1152/720] w-full rounded-corner-large ${theater ? '' : 'max-w-xl'}`}
      />
      <p className="text-body-medium text-on-surface-variant">
        Next pressed {played} {played === 1 ? 'time' : 'times'}; Autoplay is{' '}
        {autoplay ? 'on' : 'off'}.
      </p>
    </div>
  );
}
