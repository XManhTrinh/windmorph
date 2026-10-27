/**
 * The home page bento's loop, shared by the live bento and the script that records its video
 * (`scripts/record-bento.ts`), so the recording always covers exactly one loop.
 */

/** Google's bento loop: each state holds for about a second and a half. */
export const BENTO_STEP_MS = 1500;

/** The six built-in themes, one per active-and-rest round, as the hero cycles them. */
export const BENTO_THEMES = ['baseline', 'ocean', 'forest', 'sunset', 'rose', 'slate'] as const;

/**
 * One whole loop: an active step and a resting step for each theme, ending back on the first
 * theme at rest, where it started (18 seconds).
 */
export const BENTO_LOOP_MS = BENTO_STEP_MS * 2 * BENTO_THEMES.length;
