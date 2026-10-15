import { describe, expect, it } from 'vitest';
import { BENTO_LOOP_MS } from '../components/home/bento-loop';
import {
  LOOP_START_OFFSET_MS,
  cropFor,
  encodeJobs,
  loopWindow,
  sampleFrames,
} from './bento-recording';

describe('cropFor', () => {
  it('crops exactly the measured bento box', () => {
    expect(cropFor({ x: 144, y: 70, width: 1152, height: 720 }, 1440, 860)).toEqual({
      x: 144,
      y: 70,
      width: 1152,
      height: 720,
    });
  });

  it('rounds to whole pixels with an even size', () => {
    expect(cropFor({ x: 10.4, y: 9.6, width: 101.2, height: 51 }, 400, 300)).toEqual({
      x: 10,
      y: 10,
      width: 100,
      height: 50,
    });
  });

  it('refuses a box that runs off the frame', () => {
    expect(() => cropFor({ x: 400, y: 70, width: 1152, height: 720 }, 1440, 860)).toThrow(
      /doesn't fit/,
    );
  });
});

describe('loopWindow', () => {
  const marks = [
    { theme: 'ocean', t: 1000 },
    { theme: 'slate', t: 16000 },
    { theme: 'baseline', t: 19000 },
    { theme: 'ocean', t: 22000 },
    { theme: 'baseline', t: 37005 },
  ];

  it('runs from one return to the first theme to the next, once settled', () => {
    expect(loopWindow(marks, 'baseline')).toEqual({
      start: 19000 + LOOP_START_OFFSET_MS,
      end: 37005 + LOOP_START_OFFSET_MS,
    });
  });

  it('waits for the second return', () => {
    expect(loopWindow(marks.slice(0, 4), 'baseline')).toBeUndefined();
  });

  it('is one loop of the bento: each theme resting and active', () => {
    expect(BENTO_LOOP_MS).toBe(18_000);
  });
});

describe('sampleFrames', () => {
  it('takes the latest captured frame at each video frame, ending a frame before the loop', () => {
    // Captured at 0, 50 and 90ms; a 100ms loop at 30fps is 3 frames, at 0, 33.3 and 66.7ms.
    expect(sampleFrames([0, 50, 90], 0, 100)).toEqual([0, 0, 1]);
  });

  it('makes 540 frames of an 18-second loop', () => {
    const captured = Array.from({ length: 2000 }, (_, index) => index * 10);
    expect(sampleFrames(captured, 500, 18_500)).toHaveLength(540);
  });

  it('needs a frame from before the loop starts', () => {
    expect(() => sampleFrames([200], 100, 300)).toThrow(/started after/);
  });
});

describe('encodeJobs', () => {
  const crop = { x: 144, y: 70, width: 1152, height: 720 };

  it('writes H.264 MP4 and VP9 WebM with a full system ffmpeg', () => {
    const jobs = encodeJobs(
      { system: { path: 'ffmpeg', encoders: new Set(['libx264', 'libvpx-vp9', 'libvpx']) } },
      crop,
    );
    expect(jobs.map((job) => job.format)).toEqual(['mp4', 'webm']);
    const [mp4, webm] = jobs;
    expect(mp4?.args).toEqual(
      expect.arrayContaining(['crop=1152:720:144:70', 'libx264', 'yuv420p', '+faststart']),
    );
    expect(webm?.args).toContain('libvpx-vp9');
  });

  it("falls back to Playwright's ffmpeg for a VP8 WebM only", () => {
    const jobs = encodeJobs({ playwright: '/browsers/ffmpeg-mac' }, crop);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.format).toBe('webm');
    expect(jobs[0]?.ffmpeg).toBe('/browsers/ffmpeg-mac');
    expect(jobs[0]?.args).toContain('libvpx');
  });

  it('prefers the system ffmpeg to Playwright’s', () => {
    const jobs = encodeJobs(
      { system: { path: 'ffmpeg', encoders: new Set(['libvpx']) }, playwright: '/pw/ffmpeg' },
      crop,
    );
    expect(jobs.map((job) => job.ffmpeg)).toEqual(['ffmpeg']);
  });

  it('has nothing to encode with without an ffmpeg', () => {
    expect(encodeJobs({}, crop)).toEqual([]);
  });
});
