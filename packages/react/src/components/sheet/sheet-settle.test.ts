// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SPRINGS } from '../../tokens/motion';
import { springWithVelocityToLinearEasing } from '../../tokens/spring-velocity';
import { releaseMotion, settleTarget } from './sheet-settle';

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

describe('settleTarget with a positional threshold (side sheets: half the width)', () => {
  // A 320px side sheet: open 0, closed 320; it closes past 160px.
  const side = [0, 320];

  it('closes past half its width, and springs back short of it', () => {
    expect(settleTarget(side, 0, 161, 0, 160)).toBe(320);
    expect(settleTarget(side, 0, 159, 0, 160)).toBe(0);
    // The bottom sheet's 56px would have closed it at a fifth of the way.
    expect(settleTarget(side, 0, 60, 0)).toBe(320);
  });

  it('closes on a fling over 125px/s toward the edge, and returns on one away', () => {
    expect(settleTarget(side, 0, 30, 130, 160)).toBe(320);
    expect(settleTarget(side, 0, 200, -130, 160)).toBe(0);
  });
});

describe('releaseMotion (both sheets)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const matchMedia = (reduced: boolean) =>
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced }) });

  it('continues at the release speed: the fast spatial spring to close, the default one back', () => {
    matchMedia(false);
    expect(releaseMotion('expressive', true, 900, 300)).toEqual(
      springWithVelocityToLinearEasing(SPRINGS.expressive.spatial.fast, 3),
    );
    expect(releaseMotion('standard', false, -400, -200)).toEqual(
      springWithVelocityToLinearEasing(SPRINGS.standard.spatial.default, 2),
    );
  });

  it("leaves the sheet's own transition under reduced motion or with nowhere to go", () => {
    matchMedia(true);
    expect(releaseMotion('expressive', true, 900, 300)).toBeNull();
    matchMedia(false);
    expect(releaseMotion('expressive', false, 900, 0.2)).toBeNull();
  });
});
