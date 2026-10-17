import type { Page } from '@playwright/test';

/** One part's animated values on one frame. */
export interface PartFrame {
  opacity: number;
  /** The computed `translate`, e.g. `"0px -50px"` or `"none"`. */
  translate: string;
  /** The computed `scale`, e.g. `"0.9"` or `"none"`. */
  scale: string;
  /** The computed `clip-path`, e.g. `"inset(0px 0px 100% round 28px)"`. */
  clipPath: string;
  /** The part's box in the window (after its own and its ancestors' translate). */
  top: number;
  left: number;
  height: number;
  width: number;
}

/** The sampled parts on one frame, `t` ms after the motion started. */
export interface Frame {
  t: number;
  parts: Record<string, PartFrame | null>;
}

export interface SampleMotionOptions {
  /**
   * What starts the motion, run in the page so no frame passes before it is paused: a click on
   * the first element matching `click`, `key` pressed on the focused element, or `value` typed
   * into the first input matching `input` (set as a user's edit, so React sees it).
   */
  act: { click: string } | { key: string } | { input: string; value: string };
  /** A selector that matches once the motion has started (the open dialog, `[data-exiting]`). */
  started: string;
  /**
   * A property whose transition starts a frame or more after `started` matches (one that
   * follows a measurement, e.g. `height`): sampling waits until it is running.
   */
  transition?: string;
  /** Part name → selector of the element to read on every frame. */
  parts: Record<string, string>;
  /** How long to sample, in ms. @default 600 */
  duration?: number;
  /** The interval between frames, in ms. @default 16 */
  step?: number;
}

/**
 * Starts a motion and samples it frame by frame. Every CSS transition the motion starts is
 * paused at once and stepped through `currentTime` (each transition's time counts from its
 * own start, delay included, so transitions started together stay in step), reading each
 * part's computed opacity, translate, clip-path and box on every frame. The transitions are
 * finished afterwards, so an exit unmounts as it would at the end of its motion.
 */
export function sampleMotion(page: Page, options: SampleMotionOptions): Promise<Frame[]> {
  return page.evaluate(
    async ({ act, started, transition: awaited, parts, duration, step }) => {
      if ('click' in act) document.querySelector<HTMLElement>(act.click)!.click();
      else if ('input' in act) {
        const input = document.querySelector<HTMLInputElement>(act.input)!;
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setValue.call(input, act.value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const target = document.activeElement ?? document.body;
        target.dispatchEvent(
          new KeyboardEvent('keydown', { key: act.key, bubbles: true, cancelable: true }),
        );
      }
      // React commits the change in a microtask or a task.
      for (let i = 0; i < 200 && !document.querySelector(started); i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const running = () =>
        document
          .getAnimations()
          .some(
            (animation) =>
              animation instanceof CSSTransition && animation.transitionProperty === awaited,
          );
      for (let i = 0; awaited && i < 30 && !running(); i++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      const elements = Object.entries(parts).map(
        ([name, selector]) => [name, document.querySelector<HTMLElement>(selector)] as const,
      );
      // Reading styles starts any transition that hasn't started yet.
      for (const [, element] of elements) if (element) void getComputedStyle(element).opacity;
      const transitions = document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition);
      for (const transition of transitions) transition.pause();
      const frames: {
        t: number;
        parts: Record<string, ReturnType<typeof read> | null>;
      }[] = [];
      function read(element: HTMLElement) {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return {
          opacity: Number(style.opacity),
          translate: style.translate,
          scale: style.scale,
          clipPath: style.clipPath,
          top: Math.round(box.top * 10) / 10,
          left: Math.round(box.left * 10) / 10,
          height: Math.round(box.height * 10) / 10,
          width: Math.round(box.width * 10) / 10,
        };
      }
      for (let t = 0; t <= duration; t += step) {
        for (const transition of transitions) transition.currentTime = t;
        frames.push({
          t,
          parts: Object.fromEntries(
            elements.map(([name, element]) => [name, element?.isConnected ? read(element) : null]),
          ),
        });
      }
      for (const transition of transitions) transition.finish();
      return frames;
    },
    { ...options, duration: options.duration ?? 600, step: options.step ?? 16 },
  );
}

/**
 * The edges of an `inset()` clip-path in px, for a box `width` × `height`: top, right,
 * bottom, left. Each edge is a length, a percentage or a `calc(a% ± bpx)` of them, as the
 * browser writes an interpolated inset.
 */
export function insetEdges(clipPath: string, width: number, height: number): number[] {
  const inner = /^inset\((.*?)(?: round [^()]*(?:\([^()]*\)[^()]*)*)?\)$/.exec(clipPath)?.[1] ?? '';
  // Split on the spaces outside `calc()`.
  const edges: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of inner) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ' ' && depth === 0) {
      if (current) edges.push(current);
      current = '';
    } else current += char;
  }
  if (current) edges.push(current);
  // `inset(a)`, `inset(a b)`, `inset(a b c)`, `inset(a b c d)` → top, right, bottom, left.
  const [top = '0px', right = top, bottom = top, left = right] = edges;
  const toPx = (edge: string, size: number) => {
    const sum = /^calc\((-?[\d.]+)% ([+-]) ([\d.]+)px\)$/.exec(edge);
    if (sum) return (Number(sum[1]) / 100) * size + (sum[2] === '-' ? -1 : 1) * Number(sum[3]);
    return edge.endsWith('%') ? (parseFloat(edge) / 100) * size : parseFloat(edge);
  };
  return [toPx(top, height), toPx(right, width), toPx(bottom, height), toPx(left, width)];
}
