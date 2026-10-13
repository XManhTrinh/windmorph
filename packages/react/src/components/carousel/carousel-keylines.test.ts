// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  createStrategy,
  heroKeylineList,
  keylinesForScrollOffset,
  maxScrollOffset,
  multiBrowseKeylineList,
  placeItem,
  snapPositionOffset,
  type KeylineList,
} from './carousel-keylines';

const sizes = (list: KeylineList) => list.map((k) => Math.round(k.size * 10) / 10);

describe('carousel keylines (Compose Keylines.kt / Strategy.kt)', () => {
  it('arranges a 360px multi-browse carousel as large, medium and small items', () => {
    const list = multiBrowseKeylineList(360, 186, 8, 10);
    // Anchors (10px) either side of 186 + 118 + 40, which fill 360px with two 8px gaps.
    expect(sizes(list)).toEqual([10, 186, 118, 40, 10]);
    expect(list.filter((k) => !k.isAnchor).reduce((sum, k) => sum + k.size, 0) + 16).toBeCloseTo(
      360,
    );
    expect(list.filter((k) => k.isFocal)).toHaveLength(1);
    expect(list[1]!.offset).toBe(93);
  });

  it('drops the small item when there are fewer items than keylines', () => {
    // Two items: Compose removes the small keyline and refits the rest.
    const list = multiBrowseKeylineList(360, 186, 8, 2);
    expect(sizes(list)).not.toContain(40);
    expect(list.every((k) => k.isAnchor || k.size > 56)).toBe(true);
  });

  it('centres a hero item between small items', () => {
    const list = heroKeylineList(412, undefined, 8, 10, true);
    const visible = list.filter((k) => !k.isAnchor);
    expect(visible.length).toBe(3);
    expect(visible[0]!.size).toBe(visible[2]!.size);
    expect(visible[1]!.size).toBeGreaterThan(visible[0]!.size);
  });

  it('places items on the keylines and mirrors the arrangement at the end', () => {
    const strategy = createStrategy(multiBrowseKeylineList(360, 186, 8, 10), 360, 8);
    const max = maxScrollOffset(strategy, 10);
    expect(max).toBe(186 * 10 + 8 * 9 - 360);
    const start = keylinesForScrollOffset(strategy, 0, max);
    expect(placeItem(strategy, start, 0, 0)).toEqual({ size: 186, translation: 0 });
    expect(placeItem(strategy, start, 1, 0).size).toBeCloseTo(118);
    expect(placeItem(strategy, start, 2, 0).size).toBeCloseTo(40);
    const end = keylinesForScrollOffset(strategy, max, max);
    expect(placeItem(strategy, end, 9, max)).toEqual({ size: 186, translation: 0 });
    expect(placeItem(strategy, end, 8, max).size).toBeCloseTo(118);
    expect(placeItem(strategy, end, 7, max).size).toBeCloseTo(40);
  });

  it('snaps the first items at the start and the last item against the end', () => {
    const strategy = createStrategy(multiBrowseKeylineList(360, 186, 8, 10), 360, 8);
    expect(snapPositionOffset(strategy, 0, 10)).toBe(0);
    expect(snapPositionOffset(strategy, 9, 10)).toBe(360 - 186);
  });

  it('starts and ends inside the content padding, which items bleed over once scrolled', () => {
    const strategy = createStrategy(multiBrowseKeylineList(360, 186, 8, 10), 360, 8, 16, 16);
    const max = maxScrollOffset(strategy, 10);
    // Scroll range and snapping are unchanged; only the end steps move by the padding.
    expect(max).toBe(186 * 10 + 8 * 9 - 360);
    expect(snapPositionOffset(strategy, 0, 10)).toBe(0);
    const start = keylinesForScrollOffset(strategy, 0, max);
    const first = start.find((k) => k.isFocal)!;
    expect(first.offset - first.size / 2).toBeCloseTo(16);
    const end = keylinesForScrollOffset(strategy, max, max);
    const last = end.filter((k) => k.isFocal).pop()!;
    expect(last.offset + last.size / 2).toBeCloseTo(360 - 16);
    // In the middle the keylines use the whole width again.
    const middle = keylinesForScrollOffset(strategy, max / 2, max);
    expect(sizes(middle)).toEqual([10, 186, 118, 40, 10]);
  });
});
