/**
 * Records the home page bento as the video phones and tablets show in its place
 * (`pnpm --filter site record:bento`), so the video always matches the bento as built.
 *
 * It serves the static export (`out/`, so build first), opens the home page in Chromium at a
 * 1440 × 860 window and 1× in light and in dark mode, and captures the page through the
 * DevTools screencast while the bento plays. It keeps exactly one loop (`BENTO_LOOP_MS`: each
 * theme once, resting and active), measured on the page from one return to the first theme to
 * the next, so the video's end meets its start. Each frame is cropped to the bento card (the
 * grid holding the "Reply" button group, measured on the page) and encoded into
 * `public/media/bento/`:
 *
 * - `bento-{light,dark}.mp4`: H.264, `yuv420p`, `+faststart` (Safari on iPhone), when a system
 *   `ffmpeg` with libx264 is on the PATH;
 * - `bento-{light,dark}.webm`: VP9 from a system ffmpeg, else VP8 from Playwright's ffmpeg;
 * - `bento-{light,dark}.jpg`: the poster, the video's first frame;
 * - `bento.json`: the size, loop length and formats, which the site reads at build time.
 *
 * The media aren't committed: CI and the deploy run this after the build, then build again so
 * the pages pick the video up (docs/architecture.md, "Home page bento video").
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer, type Server } from 'node:http';
import { homedir, platform } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from '@playwright/test';
import { BENTO_LOOP_MS, BENTO_THEMES } from '../components/home/bento-loop';
import { BENTO_MEDIA_DIR, type BentoManifest } from '../lib/bento-media';
import {
  BENTO_FPS,
  cropFor,
  encodeJobs,
  loopWindow,
  sampleFrames,
  type Box,
  type Crop,
  type Encoders,
  type ThemeMark,
} from './bento-recording';

const SITE_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT_DIR = join(SITE_DIR, 'out');
const MEDIA_DIR = join(SITE_DIR, BENTO_MEDIA_DIR);

/** The desktop window the bento is recorded at, in CSS pixels at 1×. */
const VIEWPORT = { width: 1440, height: 860 };

/** The longest the recording may take to see two whole loops start, with room to load. */
const RECORD_TIMEOUT_MS = 2 * BENTO_LOOP_MS + 30_000;

/** The measured loop may drift from `BENTO_LOOP_MS` by this much before the script warns. */
const LOOP_TOLERANCE_MS = 150;

const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/** Serves `out/` as a static host would: `/path` from `path.html`, or `path/index.html`. */
function serveExport(): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const base = normalize(join(OUT_DIR, pathname));
    const file = [base, `${base}.html`, join(base, 'index.html')].find(
      (candidate) =>
        (candidate === OUT_DIR || candidate.startsWith(OUT_DIR + sep)) &&
        existsSync(candidate) &&
        statSync(candidate).isFile(),
    );
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });
  return new Promise((resolveServer) =>
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolveServer({ server, origin: `http://127.0.0.1:${port}` });
    }),
  );
}

/** The system ffmpeg's encoders, and Playwright's bundled ffmpeg if it's installed. */
function findEncoders(): Encoders {
  const encoders: Encoders = {};
  const listed = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (listed.status === 0) {
    const names = listed.stdout
      .split('\n')
      .map((line) => line.trim().split(/\s+/)[1])
      .filter((name): name is string => Boolean(name));
    encoders.system = { path: 'ffmpeg', encoders: new Set(names) };
  }
  const browsers =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    {
      darwin: join(homedir(), 'Library', 'Caches', 'ms-playwright'),
      win32: join(process.env.LOCALAPPDATA ?? homedir(), 'ms-playwright'),
    }[platform() as string] ??
    join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(browsers)) {
    for (const folder of readdirSync(browsers).filter((name) => name.startsWith('ffmpeg-'))) {
      const binary = readdirSync(join(browsers, folder)).find((name) =>
        /^ffmpeg-(mac|linux|win64\.exe)/.test(name),
      );
      if (binary) encoders.playwright = join(browsers, folder, binary);
    }
  }
  return encoders;
}

interface Recording {
  /** Every captured frame (JPEG) and when it was shown, in milliseconds since the epoch. */
  frames: { t: number; jpeg: Buffer }[];
  crop: Crop;
  start: number;
  end: number;
  poster: Buffer;
}

/** Plays the bento in `mode` until one whole loop has been captured. */
async function record(browser: Browser, origin: string, mode: Mode): Promise<Recording> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: mode,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // The bento card: the grid holding the "Reply" button group. Centred in the window, below
  // the app bar, and marked each time its theme changes.
  const box = await page.evaluate((viewportHeight): Box => {
    // From the group's parent: the connected group is itself a grid.
    const grid = document.querySelector('[aria-label="Reply"]')?.parentElement?.closest('.grid');
    if (!(grid instanceof HTMLElement)) throw new Error('The bento is not on the home page.');
    const marks: { theme: string; t: number }[] = [];
    Object.assign(window, { bentoMarks: marks });
    new MutationObserver(() =>
      marks.push({ theme: grid.dataset.theme ?? '', t: Date.now() }),
    ).observe(grid, { attributes: true, attributeFilter: ['data-theme'] });
    const top = grid.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - Math.round((viewportHeight - grid.offsetHeight) / 2));
    const rect = grid.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }, VIEWPORT.height);
  const crop = cropFor(box, VIEWPORT.width, VIEWPORT.height);

  const frames: Recording['frames'] = [];
  const cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', (frame) => {
    frames.push({
      t: (frame.metadata.timestamp ?? Date.now() / 1000) * 1000,
      jpeg: Buffer.from(frame.data, 'base64'),
    });
    cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => undefined);
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    everyNthFrame: 1,
    maxWidth: VIEWPORT.width,
    maxHeight: VIEWPORT.height,
  });

  const firstTheme = BENTO_THEMES[0];
  const deadline = Date.now() + RECORD_TIMEOUT_MS;
  let loop: { start: number; end: number } | undefined;
  for (;;) {
    const marks = await page.evaluate(
      () => (window as unknown as { bentoMarks: { theme: string; t: number }[] }).bentoMarks,
    );
    loop = loopWindow(marks as ThemeMark[], firstTheme);
    const last = frames.at(-1)?.t ?? 0;
    if (loop && last >= loop.end) break;
    if (Date.now() > deadline) throw new Error(`No whole loop of the ${mode} bento was captured.`);
    await page.waitForTimeout(250);
  }
  await cdp.send('Page.stopScreencast');

  const loopMs = loop.end - loop.start;
  if (Math.abs(loopMs - BENTO_LOOP_MS) > LOOP_TOLERANCE_MS) {
    console.warn(`The ${mode} loop took ${loopMs}ms, not ${BENTO_LOOP_MS}ms.`);
  }

  // The poster: the video's first frame, cropped in the browser (no image library needed).
  const first =
    frames[
      sampleFrames(
        frames.map((frame) => frame.t),
        loop.start,
        loop.end,
      )[0] ?? 0
    ];
  if (!first) throw new Error('No frames were captured.');
  const posterUrl = await page.evaluate(
    async ({ jpeg, crop: area }) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${jpeg}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = area.width;
      canvas.height = area.height;
      canvas.getContext('2d')?.drawImage(image, -area.x, -area.y);
      return canvas.toDataURL('image/jpeg', 0.85);
    },
    { jpeg: first.jpeg.toString('base64'), crop },
  );
  await context.close();
  return {
    frames,
    crop,
    start: loop.start,
    end: loop.end,
    poster: Buffer.from(posterUrl.slice(posterUrl.indexOf(',') + 1), 'base64'),
  };
}

/** Pipes the frames into ffmpeg as a stream of JPEGs (all Playwright's ffmpeg reads). */
function encode(ffmpeg: string, args: string[], jpegs: Buffer[], output: string): Promise<void> {
  return new Promise((resolveEncode, reject) => {
    const child = spawn(
      ffmpeg,
      [
        ...['-y', '-loglevel', 'error'],
        ...['-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(BENTO_FPS), '-i', 'pipe:0'],
        ...args,
        output,
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    );
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolveEncode() : reject(new Error(`ffmpeg exited with ${code} for ${output}`)),
    );
    for (const jpeg of jpegs) child.stdin.write(jpeg);
    child.stdin.end();
  });
}

const megabytes = (file: string) => `${(statSync(file).size / 1e6).toFixed(2)} MB`;

async function main() {
  if (!existsSync(join(OUT_DIR, 'index.html'))) {
    throw new Error(
      'No static export in apps/site/out: build the site first (pnpm --filter site build).',
    );
  }
  const encoders = findEncoders();
  const probe = encodeJobs(encoders, { x: 0, y: 0, width: 2, height: 2 });
  if (!probe.some((job) => job.format === 'webm')) {
    throw new Error(
      'No ffmpeg to encode with: install ffmpeg, or Playwright’s (playwright install chromium).',
    );
  }
  if (!probe.some((job) => job.format === 'mp4')) {
    console.warn(
      'No ffmpeg with libx264 on the PATH, so only WebM is written; Safari on iPhone and iPad needs the MP4. ' +
        'Install ffmpeg (macOS: brew install ffmpeg; Ubuntu: sudo apt-get install ffmpeg).',
    );
  }

  rmSync(MEDIA_DIR, { recursive: true, force: true });
  mkdirSync(MEDIA_DIR, { recursive: true });

  const { server, origin } = await serveExport();
  const browser = await chromium.launch();
  let manifest: BentoManifest | undefined;
  try {
    for (const mode of MODES) {
      const recording = await record(browser, origin, mode);
      const indices = sampleFrames(
        recording.frames.map((frame) => frame.t),
        recording.start,
        recording.end,
      );
      const jpegs = indices.map((index) => recording.frames[index]?.jpeg ?? Buffer.alloc(0));
      const jobs = encodeJobs(encoders, recording.crop);
      for (const job of jobs) {
        const output = join(MEDIA_DIR, `bento-${mode}.${job.format}`);
        await encode(job.ffmpeg, job.args, jpegs, output);
        console.log(`${mode} ${job.format}: ${megabytes(output)}`);
      }
      const poster = join(MEDIA_DIR, `bento-${mode}.jpg`);
      writeFileSync(poster, recording.poster);
      console.log(
        `${mode} poster: ${megabytes(poster)}; ${recording.crop.width}×${recording.crop.height}, ` +
          `${jpegs.length} frames over ${Math.round(recording.end - recording.start)}ms ` +
          `(${recording.frames.length} captured)`,
      );
      const size = { width: recording.crop.width, height: recording.crop.height };
      if (manifest && (manifest.width !== size.width || manifest.height !== size.height)) {
        throw new Error('The light and dark bentos differ in size.');
      }
      manifest = {
        ...size,
        loopMs: Math.round(recording.end - recording.start),
        formats: jobs.map((job) => job.format),
      };
    }
  } finally {
    await browser.close();
    server.close();
  }
  writeFileSync(join(MEDIA_DIR, 'bento.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
