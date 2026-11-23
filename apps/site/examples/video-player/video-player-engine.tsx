'use client';

import { VideoPlayer, type VideoEngine } from '@windmorph/react-pro';
import { useMemo } from 'react';

/**
 * A stream that a library drives, rather than a file the browser plays itself: pass
 * `{ attach(video) }`, which the player calls when playback is first asked for, and which
 * returns what detaches it. The player reads only the `<video>` element's own state and
 * events, so any engine works. Here the engine just sets a file, where yours would hand the
 * element to its library.
 */
export function VideoPlayerEngine() {
  const engine = useMemo<VideoEngine>(
    () => ({
      attach(video) {
        // A streaming library would load its manifest into `video` here.
        video.src = '/media/bento/bento-dark.webm';
        return () => {
          video.removeAttribute('src');
          video.load();
        };
      },
    }),
    [],
  );
  return (
    <VideoPlayer
      aria-label="A tour of the components"
      source={engine}
      poster={{ src: '/media/bento/bento-dark.jpg' }}
      width={1152}
      height={720}
      duration={18}
      className="aspect-[1152/720] w-full max-w-xl rounded-corner-large"
    />
  );
}
