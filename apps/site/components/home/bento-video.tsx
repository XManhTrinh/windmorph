'use client';

import { IconButton, cn, useTheme } from '@windmorph/react';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BENTO_MEDIA_URL, type BentoManifest } from '../../lib/bento-media';
import { PauseIcon, PlayArrowIcon } from '../icons';
import { ExpressiveBento } from './expressive-bento';

/** The site's large window class and up (1200px), where the live bento shows. */
const LARGE_UP = '(min-width: 1200px)';

const MIME_TYPES = { mp4: 'video/mp4', webm: 'video/webm' } as const;

const subscribeNever = () => () => {};

/** True once hydrated; false on the server and during hydration, so the two always match. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * Whether the window is large or wider, kept in step with it. `undefined` on the server and
 * during hydration, when the window isn't known, so the server's HTML and the first client
 * render match.
 */
function useLargeUp(): boolean | undefined {
  const subscribe = useCallback((onChange: () => void) => {
    const list = window.matchMedia(LARGE_UP);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);
  return useSyncExternalStore<boolean | undefined>(
    subscribe,
    () => window.matchMedia(LARGE_UP).matches,
    () => undefined,
  );
}

export interface BentoVideoProps {
  /** The recording's manifest: its size and formats. */
  video: BentoManifest;
  className?: string;
}

/**
 * The bento as a video, for phones and tablets: a recording of the desktop bento
 * (`record:bento`), in the site's resolved colour mode. Nothing loads until it scrolls into view,
 * where it plays muted on a loop; it pauses out of view. A pause / play button stops it (WCAG
 * 2.2.2), and with reduced motion it waits on its poster for a press of play. Switching the
 * colour mode swaps the video at the same moment of the loop. The video is decorative; a visually
 * hidden sentence says what it shows.
 */
export function BentoVideo({ video, className }: BentoVideoProps) {
  const { resolvedMode } = useTheme();
  const reduceMotion = useReducedMotion() ?? false;
  const hydrated = useHydrated();
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  // The visitor's own choice wins; until they make one, reduced motion means paused.
  const [choice, setChoice] = useState<'play' | 'pause'>();
  const paused = choice ? choice === 'pause' : hydrated && reduceMotion;
  const playing = inView && !paused;
  // The sources are added the first time it should play, and kept.
  const [loaded, setLoaded] = useState(false);
  if (playing && !loaded) setLoaded(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // A new set of sources (the first, or another colour mode): load it, at the same moment.
  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded) return;
    const time = element.currentTime;
    element.load();
    if (time > 0) {
      element.addEventListener(
        'loadedmetadata',
        () => {
          element.currentTime = time;
        },
        { once: true },
      );
    }
  }, [loaded, resolvedMode]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded) return;
    if (playing) {
      // A browser may still refuse to play (data saver); the poster stays, with play.
      element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, [playing, loaded, resolvedMode]);

  const base = `${BENTO_MEDIA_URL}/bento-${resolvedMode}`;

  return (
    <div data-bento-video className={cn('relative', className)}>
      <div
        className={cn(
          // The poster as a background too, in the mode the pre-paint script set, so it shows
          // before hydration (when the resolved mode isn't known yet).
          'overflow-hidden rounded-corner-extra-large bg-cover',
          'bg-[url(/media/bento/bento-light.jpg)] dark:bg-[url(/media/bento/bento-dark.jpg)]',
        )}
        style={{ aspectRatio: `${video.width} / ${video.height}` }}
      >
        <p className="sr-only">
          A looping video of M3 Expressive components switching between a resting and an active
          state as the theme changes: a FAB menu, toolbars, a button group, progress and loading
          indicators, an icon button and a navigation rail.
        </p>
        <video
          ref={ref}
          aria-hidden="true"
          width={video.width}
          height={video.height}
          poster={hydrated ? `${base}.jpg` : undefined}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          className="block size-full"
        >
          {loaded
            ? video.formats.map((format) => (
                <source key={format} src={`${base}.${format}`} type={MIME_TYPES[format]} />
              ))
            : null}
        </video>
      </div>
      {/* As on M3's own site: a 56px round button over the card's end corner, its centre 12px
          in from each edge (on the corner's curve), overhanging by 16px, which the page gutter
          and the gap below hold. Playing, a translucent inverse surface keeps it readable over
          any frame; paused, it's a filled (primary) play button. */}
      <IconButton
        size="md"
        icon={paused ? <PlayArrowIcon /> : <PauseIcon />}
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        data-state={paused ? 'paused' : 'playing'}
        onPress={() => setChoice(paused ? 'play' : 'pause')}
        className={cn(
          'absolute -end-4 -bottom-4',
          !paused &&
            '[--md-comp-icon-button-filled-container-color:color-mix(in_srgb,var(--md-sys-color-inverse-surface)_80%,transparent)] [--md-comp-icon-button-filled-icon-color:var(--md-sys-color-inverse-on-surface)]',
        )}
      />
    </div>
  );
}

export interface ResponsiveBentoProps {
  /** The recorded video, or `undefined` when the build has none (then the bento is live). */
  video?: BentoManifest;
}

/**
 * The home page bento: live from the large window class up, the recorded video below it.
 * Both are in the server's HTML (CSS shows the one for the window), and once hydrated only
 * the one for the window stays, so a phone or tablet never runs the live bento's loop and a wider
 * window loads no video. Without a recording, every window gets the live bento.
 */
export function ResponsiveBento({ video }: ResponsiveBentoProps) {
  const largeUp = useLargeUp();
  if (!video) return <ExpressiveBento />;
  return (
    <>
      {largeUp !== false ? (
        <ExpressiveBento className={largeUp ? undefined : 'max-large:hidden'} />
      ) : null}
      {largeUp !== true ? (
        <BentoVideo video={video} className={largeUp === false ? undefined : 'large:hidden'} />
      ) : null}
    </>
  );
}
