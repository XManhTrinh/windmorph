import { describe, expect, it } from 'vitest';
import { pressAreaReach } from './carousel-press-area';

describe('pressAreaReach', () => {
  it('leaves items of 48px or more alone', () => {
    expect(pressAreaReach([{ start: 16, size: 186 }], 0, 8, 360)).toEqual({ start: 0, end: 0 });
  });

  it('widens a 40px item to 48px, 4px each side, between two neighbours', () => {
    const spans = [
      { start: 0, size: 100 },
      { start: 108, size: 40 },
      { start: 156, size: 100 },
    ];
    expect(pressAreaReach(spans, 1, 8, 360)).toEqual({ start: 4, end: 4 });
  });

  it('grows the other way at the viewport’s edge', () => {
    // The trailing small item of a multi-browse carousel ends at the viewport's end.
    const spans = [
      { start: 202, size: 110 },
      { start: 320, size: 40 },
      { start: 368, size: 10 },
    ];
    expect(pressAreaReach(spans, 1, 8, 360)).toEqual({ start: 8, end: 0 });
  });

  it('takes only half the spacing next to another growing item', () => {
    const spans = [
      { start: 0, size: 40 },
      { start: 48, size: 40 },
      { start: 96, size: 200 },
    ];
    // At the start edge, item 0 can only grow toward item 1, which grows too: 4px.
    expect(pressAreaReach(spans, 0, 8, 360)).toEqual({ start: 0, end: 4 });
    expect(pressAreaReach(spans, 1, 8, 360)).toEqual({ start: 4, end: 4 });
  });
});
