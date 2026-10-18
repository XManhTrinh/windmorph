import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BENTO_MEDIA_DIR } from './bento-media';
import { readBentoVideo } from './bento-video';

describe('readBentoVideo', () => {
  let site: string;
  let media: string;
  const manifest = { width: 1152, height: 720, loopMs: 18000, formats: ['mp4', 'webm'] };
  const write = (file: string, content = 'x') => writeFileSync(join(media, file), content);
  const writeAll = () => {
    write('bento.json', JSON.stringify(manifest));
    for (const mode of ['light', 'dark']) {
      for (const extension of ['jpg', 'mp4', 'webm']) write(`bento-${mode}.${extension}`);
    }
  };

  beforeEach(() => {
    site = mkdtempSync(join(tmpdir(), 'bento-'));
    media = join(site, BENTO_MEDIA_DIR);
    mkdirSync(media, { recursive: true });
  });

  afterEach(() => rmSync(site, { recursive: true, force: true }));

  it('reads the manifest when every file it lists is there', () => {
    writeAll();
    expect(readBentoVideo(site)).toEqual(manifest);
  });

  it('is undefined without a recording', () => {
    expect(readBentoVideo(site)).toBeUndefined();
  });

  it('is undefined when a listed file is missing', () => {
    writeAll();
    rmSync(join(media, 'bento-dark.mp4'));
    expect(readBentoVideo(site)).toBeUndefined();
  });

  it('is undefined for a broken manifest', () => {
    writeAll();
    write('bento.json', '{"width": 0');
    expect(readBentoVideo(site)).toBeUndefined();
    write('bento.json', JSON.stringify({ ...manifest, formats: ['gif'] }));
    expect(readBentoVideo(site)).toBeUndefined();
  });
});
