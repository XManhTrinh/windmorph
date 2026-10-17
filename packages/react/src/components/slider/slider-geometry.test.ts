// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { positionOf, segmentLength, trackGeometry } from './slider-geometry';

describe('slider geometry (Compose drawTrack)', () => {
  it('places continuous thumbs linearly and discrete ones between the corners', () => {
    expect(positionOf(0.25, [])).toBe('calc(100% * 0.25)');
    expect(positionOf(0.5, [0, 0.5, 1])).toBe(
      'calc(var(--m3-slider-corner) + (100% - 2 * var(--m3-slider-corner)) * 0.5)',
    );
    // The first and last ticks line up with the ends.
    expect(positionOf(1, [0, 0.5, 1])).toBe('calc(100% * 1)');
  });

  it('draws an active then an inactive segment with a stop at the end', () => {
    const { segments, ticks } = trackGeometry({ fractions: [0.3], ticks: [], centered: false });
    expect(segments).toHaveLength(2);
    const [active, inactive] = segments;
    expect(active).toMatchObject({
      tone: 'active',
      start: '0px',
      end: 'calc(calc(100% * 0.3) - (2px + var(--m3-slider-gap-0)))',
      startRadius: 'var(--m3-slider-corner)',
      endRadius: '2px',
      threshold: 'var(--m3-slider-corner)',
      icon: 'start',
    });
    expect(inactive).toMatchObject({ tone: 'inactive', end: '100%', stopAtEnd: true, icon: 'end' });
    expect(ticks).toEqual([]);
  });

  it('hides segments shorter than the threshold', () => {
    const length = segmentLength({
      tone: 'active',
      start: '0px',
      end: '10px',
      threshold: '8px',
      startRadius: '8px',
      endRadius: '2px',
    });
    expect(length).toBe('max(0px, min((10px - 0px), max(0px, ((10px - 0px) - 8px) * 10000)))');
  });

  it('centres the active segment and leaves a plain gap at the centre', () => {
    const after = trackGeometry({ fractions: [0.8], ticks: [], centered: true }).segments;
    expect(after.map((s) => s.tone)).toEqual(['inactive', 'active', 'inactive']);
    expect(after[0]!.end).toBe('calc(50% - var(--m3-slider-gap-0))');
    expect(after[1]!.start).toBe('50%');
    expect(after[0]!.stopAtStart).toBe(true);
    expect(after[2]!.stopAtEnd).toBe(true);
    const before = trackGeometry({ fractions: [0.2], ticks: [], centered: true }).segments;
    expect(before[1]!.end).toBe('50%');
    expect(before[2]!.start).toBe('calc(50% + var(--m3-slider-gap-0))');
  });

  it('draws a range between two thumbs with stops at both ends', () => {
    const { segments } = trackGeometry({ fractions: [0.2, 0.7], ticks: [], centered: false });
    expect(segments.map((s) => [s.tone, s.startRadius, s.endRadius])).toEqual([
      ['inactive', 'var(--m3-slider-corner)', '2px'],
      ['active', '2px', '2px'],
      ['inactive', '2px', 'var(--m3-slider-corner)'],
    ]);
    expect(segments[1]!.end).toContain('var(--m3-slider-gap-1)');
  });

  it('colours ticks by the active range and skips the thumb and the stops', () => {
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const single = trackGeometry({ fractions: [0.5], ticks, centered: false }).ticks;
    // 0 and 0.25 are active, 0.5 is under the thumb, 1 is the stop indicator.
    expect(single.map((t) => t.active)).toEqual([true, true, false]);
    const range = trackGeometry({ fractions: [0.25, 0.75], ticks, centered: false }).ticks;
    // Both ends have stops; the thumbs cover 0.25 and 0.75.
    expect(range).toHaveLength(1);
    expect(range[0]!.active).toBe(true);
    const centered = trackGeometry({ fractions: [1], ticks, centered: true }).ticks;
    // The centre tick is left out; 0.75 is active.
    expect(centered.map((t) => t.active)).toEqual([false, true]);
  });
});
