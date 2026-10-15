import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The geometry of one part on one frame: everything that moves it, sizes it, turns it or
 * reshapes it. Opacity and colour are left out: a fade is what reduced motion keeps.
 */
interface Geometry {
  top: number;
  left: number;
  width: number;
  height: number;
  transform: string;
  translate: string;
  scale: string;
  rotate: string;
  clipPath: string;
  borderRadius: string;
}

/** CSS transitions that may still run under reduced motion: fades, colours and resets. */
const ALLOWED_TRANSITIONS = new Set([
  'opacity',
  'visibility',
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'box-shadow',
  'fill',
  'stroke',
  'caret-color',
  'text-decoration-color',
  // The state layer's opacities.
  '--m3-state-opacity',
  '--m3-ripple-opacity',
  // The ripple's size and centre reset after it has faded out, unseen (utilities.css).
  '--m3-ripple-radius',
  '--m3-ripple-x',
  '--m3-ripple-y',
]);

export interface ReducedMotionOptions {
  /**
   * Part name → the element to watch: a CSS selector, looked up on every frame (the first
   * match), so it may appear or go during the change; or a locator for an element that is
   * already in the page, which is tagged and followed.
   */
  parts: Record<string, string | Locator>;
  /** What starts the change: clicks, keys, scrolling. Runs while the frames are recorded. */
  act: () => Promise<unknown>;
  /** How long to record after `act` resolves, in ms. @default 700 */
  duration?: number;
  /** Extra transition properties to allow (each with the reason in the test). */
  allow?: readonly string[];
}

/** A recorded frame: the geometry, plus the opacity, which may change gradually. */
type Frame = Geometry & { opacity: number };

export interface ReducedMotionResult {
  /** Each part's geometry and opacity on every frame it was in the page. */
  frames: Record<string, Frame[]>;
  /** Every transition property that started inside the parts' trees. */
  transitions: string[];
}

/**
 * Records a change under reduced motion and checks that nothing moved: on every frame each
 * part's box, transforms, clip and corners are either what they were on the first frame or
 * what they are on the last (an instant change), and no CSS transition beyond fades and
 * colours ran. Frames come from `requestAnimationFrame` in the page, so motion driven by
 * script (Motion springs, scroll animations) is caught as well as CSS transitions. The page
 * must already prefer reduced motion (components read it as they mount); assert the end
 * state on the result or the page.
 */
export async function expectNoMovement(
  page: Page,
  { parts, act, duration = 700, allow = [] }: ReducedMotionOptions,
): Promise<ReducedMotionResult> {
  expect(
    await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    'open the story under reduced motion: test.use({ reducedMotion: "reduce" })',
  ).toBe(true);
  const selectors: Record<string, string> = {};
  for (const [name, part] of Object.entries(parts)) {
    if (typeof part === 'string') {
      selectors[name] = part;
    } else {
      await part.evaluate(
        (element, tag) => element.setAttribute('data-reduced-motion-part', tag),
        name,
      );
      selectors[name] = `[data-reduced-motion-part="${name}"]`;
    }
  }
  await page.evaluate((watched) => {
    const store = window as unknown as {
      reducedMotionRecording?: { stop: boolean; frames: Record<string, unknown[]>; runs: string[] };
    };
    const recording = {
      stop: false,
      frames: Object.fromEntries(Object.keys(watched).map((name) => [name, [] as unknown[]])),
      runs: [] as string[],
    };
    store.reducedMotionRecording = recording;
    const roots = () =>
      Object.values(watched)
        .map((selector) => document.querySelector(selector))
        .filter((element): element is Element => element !== null);
    document.addEventListener(
      'transitionrun',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (roots().some((root) => root === target || root.contains(target))) {
          recording.runs.push(event.propertyName);
        }
      },
      true,
    );
    const sample = () => {
      if (recording.stop) return;
      for (const [name, selector] of Object.entries(watched)) {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) continue;
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        recording.frames[name]!.push({
          top: Math.round(box.top * 10) / 10,
          left: Math.round(box.left * 10) / 10,
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
          transform: style.transform,
          translate: style.translate,
          scale: style.scale,
          rotate: style.rotate,
          clipPath: style.clipPath,
          borderRadius: style.borderRadius,
          opacity: Number(style.opacity),
        });
      }
      requestAnimationFrame(sample);
    };
    sample();
  }, selectors);
  await act();
  await page.waitForTimeout(duration);
  const result = await page.evaluate(() => {
    const store = window as unknown as {
      reducedMotionRecording: { stop: boolean; frames: Record<string, Frame[]>; runs: string[] };
    };
    store.reducedMotionRecording.stop = true;
    return {
      frames: store.reducedMotionRecording.frames,
      transitions: [...new Set(store.reducedMotionRecording.runs)],
    };
  });

  const allowed = new Set([...ALLOWED_TRANSITIONS, ...allow]);
  expect(
    result.transitions.filter((property) => !allowed.has(property)),
    'transitions that move, size, turn or reshape',
  ).toEqual([]);
  for (const [name, frames] of Object.entries(result.frames)) {
    expect(frames.length, `${name} was never in the page`).toBeGreaterThan(0);
    const first = frames[0]!;
    const last = frames.at(-1)!;
    for (const key of (Object.keys(first) as (keyof Frame)[]).filter((k) => k !== 'opacity')) {
      const between = frames
        .map((frame) => frame[key])
        .filter((value) => value !== first[key] && value !== last[key]);
      expect(
        between,
        `${name} ${key} passed through values between ${first[key]} and ${last[key]}`,
      ).toEqual([]);
    }
  }
  return result;
}

/** Whether a part's `key` changed between the first and last recorded frames. */
export function changed(result: ReducedMotionResult, part: string, key: keyof Geometry): boolean {
  const frames = result.frames[part]!;
  return frames[0]![key] !== frames.at(-1)![key];
}

/** Whether a part faded: some frame showed it partly transparent. */
export function faded(result: ReducedMotionResult, part: string): boolean {
  return result.frames[part]!.some((frame) => frame.opacity > 0.02 && frame.opacity < 0.98);
}
