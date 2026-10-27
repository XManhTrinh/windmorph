/**
 * The pure parts of `record-bento.ts`: where the loop starts and ends, which captured frame
 * shows at each moment of the video, the crop, and the ffmpeg commands. Kept apart from the
 * browser and file work so they're unit-tested (`bento-recording.test.ts`).
 */
import type { BentoVideoFormat } from '../lib/bento-media';

/** The video's frame rate. */
export const BENTO_FPS = 30;

/**
 * How long after the bento comes back to rest on its first theme the video starts: its
 * springs and colour transition (500ms) have settled, and the next press (1340ms after the
 * theme changes) hasn't started, so the first frame, which is also the poster, shows it at rest.
 */
export const LOOP_START_OFFSET_MS = 1200;

/** A box in CSS pixels, as `getBoundingClientRect` gives it. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** An ffmpeg crop in whole pixels, its size even for `yuv420p`. */
export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A theme change on the bento, in milliseconds since the epoch. */
export interface ThemeMark {
  theme: string;
  t: number;
}

/**
 * The bento's crop within a captured frame (`frameWidth` × `frameHeight`, 1 CSS pixel to 1
 * pixel): the box rounded to whole pixels, its size made even. Throws when the box doesn't sit
 * wholly inside the frame, which would cut the bento off.
 */
export function cropFor(box: Box, frameWidth: number, frameHeight: number): Crop {
  const x = Math.round(box.x);
  const y = Math.round(box.y);
  const width = Math.round(box.width);
  const height = Math.round(box.height);
  const crop = { x, y, width: width - (width % 2), height: height - (height % 2) };
  if (
    crop.width <= 0 ||
    crop.height <= 0 ||
    crop.x < 0 ||
    crop.y < 0 ||
    crop.x + crop.width > frameWidth ||
    crop.y + crop.height > frameHeight
  ) {
    throw new Error(
      `The bento (${width}×${height} at ${x},${y}) doesn't fit in the ${frameWidth}×${frameHeight} frame.`,
    );
  }
  return crop;
}

/**
 * One loop of the recording: from `LOOP_START_OFFSET_MS` after the bento first comes back to
 * `firstTheme` (from the last theme, so a whole round has played) to the same moment after it
 * next does. Measured on the page, so the video's end meets its start whatever the timers'
 * drift. Returns `undefined` until both have happened.
 */
export function loopWindow(
  marks: readonly ThemeMark[],
  firstTheme: string,
): { start: number; end: number } | undefined {
  const returns = marks.filter((mark) => mark.theme === firstTheme);
  const [first, second] = returns;
  if (!first || !second) return undefined;
  return { start: first.t + LOOP_START_OFFSET_MS, end: second.t + LOOP_START_OFFSET_MS };
}

/**
 * Which captured frame each frame of the video shows. The screencast sends a frame only when
 * the page changes, so each video frame takes the latest one captured by its time. The loop
 * is divided into a whole number of frames at `fps`; the last one is one frame before `end`,
 * whose picture is the first frame's, so the video loops seamlessly.
 */
export function sampleFrames(
  capturedAt: readonly number[],
  start: number,
  end: number,
  fps: number = BENTO_FPS,
): number[] {
  const count = Math.round(((end - start) / 1000) * fps);
  const indices: number[] = [];
  let index = -1;
  for (let frame = 0; frame < count; frame++) {
    const time = start + ((end - start) * frame) / count;
    while (index + 1 < capturedAt.length && (capturedAt[index + 1] ?? Infinity) <= time) index++;
    if (index < 0) throw new Error('The screencast started after the loop did.');
    indices.push(index);
  }
  return indices;
}

/** The ffmpeg encoders the recorder can use. */
export interface Encoders {
  /** A system `ffmpeg` (on the PATH) and the encoders it lists. */
  system?: { path: string; encoders: ReadonlySet<string> };
  /** Playwright's bundled ffmpeg: VP8 only, reading JPEGs from a pipe. */
  playwright?: string;
}

/** One video to write: the ffmpeg to run and its output arguments (after the input). */
export interface EncodeJob {
  format: BentoVideoFormat;
  ffmpeg: string;
  args: string[];
}

/**
 * The videos to encode with the encoders available: H.264 MP4 (`yuv420p`, `+faststart`, for
 * Safari on iPhone) when a system ffmpeg has libx264; WebM in VP9 from a system ffmpeg with
 * libvpx-vp9, else in VP8 (system libvpx, then Playwright's ffmpeg). Each aims at about 1 MB
 * for the 18-second loop.
 */
export function encodeJobs(encoders: Encoders, crop: Crop): EncodeJob[] {
  const filter = ['-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`, '-an'];
  const jobs: EncodeJob[] = [];
  const system = encoders.system;
  if (system?.encoders.has('libx264')) {
    jobs.push({
      format: 'mp4',
      ffmpeg: system.path,
      args: [
        ...filter,
        ...['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-tune', 'animation'],
        ...['-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
      ],
    });
  }
  const vp8 = [
    ...['-c:v', 'libvpx', '-b:v', '1M', '-crf', '10', '-qmin', '4', '-qmax', '40'],
    ...['-auto-alt-ref', '0', '-deadline', 'good', '-cpu-used', '1'],
  ];
  if (system?.encoders.has('libvpx-vp9')) {
    jobs.push({
      format: 'webm',
      ffmpeg: system.path,
      args: [
        ...filter,
        ...['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1'],
        ...['-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p'],
      ],
    });
  } else if (system?.encoders.has('libvpx')) {
    jobs.push({ format: 'webm', ffmpeg: system.path, args: [...filter, ...vp8] });
  } else if (encoders.playwright) {
    jobs.push({ format: 'webm', ffmpeg: encoders.playwright, args: [...filter, ...vp8] });
  }
  return jobs;
}
