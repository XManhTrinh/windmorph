// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

/*
 * The page's number formatter is a module of its own, so a component that writes only numbers
 * (a badge's count, a slider's value) never carries the date formatter with it.
 */
describe('usePageNumberFormatter', () => {
  it('carries no date formatter', () => {
    expect(source('./use-page-number-formatter.ts')).not.toMatch(/@internationalized\/date|Date/);
  });

  it.each([
    '../components/badge/Badge.tsx',
    '../components/slider/Slider.tsx',
    '../components/carousel/Carousel.tsx',
    '../components/progress/ProgressIndicator.tsx',
    '../components/loading-indicator/LoadingIndicator.tsx',
  ])('is all %s takes', (path) => {
    const imports = source(path).match(/from '[^']*use-page-[a-z-]*'/g) ?? [];
    expect(imports).toEqual(["from '../../primitives/use-page-number-formatter'"]);
  });
});
