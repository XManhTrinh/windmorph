/** Reads the home page bento's recorded video at build time (server only: it uses Node's fs). */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BENTO_MEDIA_DIR, type BentoManifest } from './bento-media';

const MODES = ['light', 'dark'] as const;

function isManifest(value: unknown): value is BentoManifest {
  if (typeof value !== 'object' || value === null) return false;
  const { width, height, loopMs, formats } = value as Record<string, unknown>;
  return (
    typeof width === 'number' &&
    width > 0 &&
    typeof height === 'number' &&
    height > 0 &&
    typeof loopMs === 'number' &&
    Array.isArray(formats) &&
    formats.length > 0 &&
    formats.every((format) => format === 'mp4' || format === 'webm')
  );
}

/**
 * The recorded bento video, read at build time from `public/media/bento` under `siteDir`:
 * its manifest, when it and every file it lists (each format and the poster, in light and
 * dark) exist. Otherwise `undefined`, a build without a recording, and phones show the live
 * bento instead.
 */
export function readBentoVideo(siteDir: string = process.cwd()): BentoManifest | undefined {
  const dir = join(siteDir, BENTO_MEDIA_DIR);
  const manifestPath = join(dir, 'bento.json');
  if (!existsSync(manifestPath)) return undefined;
  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return undefined;
  }
  if (!isManifest(manifest)) return undefined;
  const files = MODES.flatMap((mode) => [
    `bento-${mode}.jpg`,
    ...manifest.formats.map((format) => `bento-${mode}.${format}`),
  ]);
  if (!files.every((file) => existsSync(join(dir, file)))) return undefined;
  return {
    width: manifest.width,
    height: manifest.height,
    loopMs: manifest.loopMs,
    formats: manifest.formats,
  };
}
