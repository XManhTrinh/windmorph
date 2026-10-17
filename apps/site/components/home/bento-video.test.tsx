import { ThemeProvider, useTheme } from '@windmorph/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BentoManifest } from '../../lib/bento-media';
import { axeViolations } from '../../test/axe';
import { BentoVideo, ResponsiveBento } from './bento-video';

// Motion reads the reduced-motion preference once per page, so the tests set it here.
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useReducedMotion: () => motion.reduce,
}));

const VIDEO: BentoManifest = { width: 1152, height: 720, loopMs: 18000, formats: ['mp4', 'webm'] };

/** The media queries that match, as `window.matchMedia` reports them. */
let matching = new Set<string>();
let intersect: (isIntersecting: boolean) => void = () => {};
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();
const load = vi.fn();

beforeEach(() => {
  matching = new Set();
  motion.reduce = false;
  // The theme provider keeps the mode in a cookie; each test starts from the default.
  document.cookie = 'windmorph-theme=; max-age=0; path=/';
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matching.has(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    })),
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = (isIntersecting) =>
          act(() =>
            callback(
              [{ isIntersecting } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
          );
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  play.mockClear();
  pause.mockClear();
  load.mockClear();
});

function DarkModeButton() {
  const { setMode } = useTheme();
  return (
    <button type="button" onClick={() => setMode('dark')}>
      Dark
    </button>
  );
}

function renderVideo() {
  const view = render(
    <ThemeProvider defaultMode="light">
      <DarkModeButton />
      <BentoVideo video={VIDEO} />
    </ThemeProvider>,
  );
  const video = view.container.querySelector('video');
  if (!video) throw new Error('No video');
  return { ...view, video };
}

const sources = (video: HTMLVideoElement) =>
  [...video.querySelectorAll('source')].map((source) => [
    source.getAttribute('src'),
    source.getAttribute('type'),
  ]);

describe('BentoVideo', () => {
  it('loads nothing until in view, then offers the MP4 and the WebM and plays', () => {
    const { video } = renderVideo();
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('aria-hidden', 'true');
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('poster', '/media/bento/bento-light.jpg');
    expect(sources(video)).toEqual([]);
    expect(play).not.toHaveBeenCalled();

    intersect(true);
    expect(sources(video)).toEqual([
      ['/media/bento/bento-light.mp4', 'video/mp4'],
      ['/media/bento/bento-light.webm', 'video/webm'],
    ]);
    expect(load).toHaveBeenCalled();
    expect(play).toHaveBeenCalled();

    intersect(false);
    expect(pause).toHaveBeenCalled();
  });

  it('describes what it shows to screen readers', () => {
    renderVideo();
    expect(screen.getByText(/A looping video of M3 Expressive components/)).toHaveClass('sr-only');
  });

  it('switches to the dark video with the colour mode', async () => {
    const { video } = renderVideo();
    intersect(true);
    load.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(sources(video)[0]?.[0]).toBe('/media/bento/bento-dark.mp4');
    expect(video).toHaveAttribute('poster', '/media/bento/bento-dark.jpg');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('pauses and plays from its button', async () => {
    renderVideo();
    intersect(true);
    play.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(pause).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Play animation' }));
    expect(play).toHaveBeenCalled();
  });

  it('with reduced motion, waits on its poster for play', async () => {
    motion.reduce = true;
    const { video } = renderVideo();
    intersect(true);
    expect(sources(video)).toEqual([]);
    expect(play).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Play animation' }));
    expect(sources(video)).toHaveLength(2);
    expect(play).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = renderVideo();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ResponsiveBento', () => {
  const renderBento = (video?: BentoManifest) =>
    render(
      <ThemeProvider>
        <ResponsiveBento video={video} />
      </ThemeProvider>,
    );

  it('shows the video, and not the live bento, on a phone or tablet', () => {
    const { container } = renderBento(VIDEO);
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Reply"]')).toBeNull();
  });

  it('shows the live bento, and no video, from the large window class', () => {
    matching.add('(min-width: 1200px)');
    const { container } = renderBento(VIDEO);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('[aria-label="Reply"]')).toBeInTheDocument();
  });

  it('falls back to the live bento on a phone without a recording', () => {
    const { container } = renderBento(undefined);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('[aria-label="Reply"]')).toBeInTheDocument();
  });
});
