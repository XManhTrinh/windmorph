// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { settleTarget } from './sheet-settle';

// A 600px sheet in a 800px window: open 0, half open 200, hidden 600.
const anchors = [0, 200, 600];

describe('settleTarget (Compose AnchoredDraggableState)', () => {
  it('returns to the origin after a short, slow drag', () => {
    expect(settleTarget(anchors, 200, 240, 0)).toBe(200);
    expect(settleTarget(anchors, 200, 160, 50)).toBe(200);
  });

  it('moves on once the drag passes 56px', () => {
    expect(settleTarget(anchors, 200, 257, 0)).toBe(600);
    expect(settleTarget(anchors, 200, 143, 0)).toBe(0);
  });

  it('follows a fling faster than 125px/s to the next anchor in its direction', () => {
    expect(settleTarget(anchors, 200, 210, 400)).toBe(600);
    expect(settleTarget(anchors, 200, 190, -400)).toBe(0);
    expect(settleTarget(anchors, 0, 20, 300)).toBe(200);
  });

  it('stays put when not moved', () => {
    expect(settleTarget(anchors, 0, 0, 999)).toBe(0);
  });
});
