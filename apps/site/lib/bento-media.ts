/**
 * The home page bento's recorded video (`scripts/record-bento.ts`): where it's written and
 * served, and its manifest. No Node APIs, so client components import it too.
 */

/** Where `scripts/record-bento.ts` writes the bento's video, poster and manifest. */
export const BENTO_MEDIA_DIR = 'public/media/bento';

/** The URL the media are served from. */
export const BENTO_MEDIA_URL = '/media/bento';

/** A video format the recorder writes, in the order the page offers them. */
export type BentoVideoFormat = 'mp4' | 'webm';

/** What the recorder writes next to the media (`bento.json`), read by the site at build time. */
export interface BentoManifest {
  /** The video's size in pixels: the bento's at a 1440px-wide window, at 1×. */
  width: number;
  height: number;
  /** The loop's length as recorded, in milliseconds. */
  loopMs: number;
  /** The formats written, in the order the page offers them. */
  formats: BentoVideoFormat[];
}
