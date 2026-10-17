import type { Page } from '@playwright/test';

/** The interval of the fake clock's animation frames. */
const FRAME_MS = 16;

/**
 * Pauses the page's fake clock before a story opens, so only {@link runFrames} moves time and
 * the page's load time never leaks into an animation.
 */
export async function pauseClock(page: Page) {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
}

/**
 * Runs a paused clock for the whole animation frames in `ms`. The fake frames fall on a 16ms
 * grid whose phase is set by the real time that passes between `install` and `pauseAt`, so a
 * span that isn't a whole number of frames runs one frame more or fewer from run to run. A
 * whole number of frames runs the same frames, whatever the phase.
 */
export async function runFrames(page: Page, ms: number) {
  await page.clock.runFor(Math.floor(ms / FRAME_MS) * FRAME_MS);
}
