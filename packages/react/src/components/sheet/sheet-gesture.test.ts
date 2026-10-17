import { describe, expect, it } from 'vitest';
import {
  contentGesture,
  DRAG_SLOP,
  edgeSign,
  ownsGesture,
  releaseVelocity,
  scrolledAbove,
  sideSwipeGesture,
} from './sheet-gesture';

describe('contentGesture', () => {
  it('stays undecided within the slop', () => {
    expect(contentGesture(0, DRAG_SLOP, false)).toBe('undecided');
    expect(contentGesture(-DRAG_SLOP, -DRAG_SLOP, true)).toBe('undecided');
  });

  it('drags the sheet on a downward move with the content at its top', () => {
    expect(contentGesture(2, 12, false)).toBe('drag');
  });

  it('scrolls on a downward move while the content is scrolled', () => {
    expect(contentGesture(0, 12, true)).toBe('scroll');
  });

  it('scrolls on an upward move once the sheet is fully raised, even at the top', () => {
    expect(contentGesture(0, -12, false)).toBe('scroll');
    // While the sheet rests below its top detent, an upward move raises it first (Compose's
    // nested scroll), unless the content is scrolled.
    expect(contentGesture(0, -12, false, true)).toBe('drag');
    expect(contentGesture(0, -12, true, true)).toBe('scroll');
    expect(contentGesture(-12, -4, false, true)).toBe('scroll');
  });

  it('leaves mostly horizontal moves to the content', () => {
    expect(contentGesture(12, 8, false)).toBe('scroll');
    expect(contentGesture(-10, 10, false)).toBe('scroll');
  });
});

describe('the content under a touch', () => {
  function tree(html: string) {
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.append(root);
    return root;
  }

  it('leaves form fields and self-dragging elements to the content', () => {
    const root = tree(
      '<input id="field"><p id="text">Text</p><div style="touch-action: none"><span id="thumb"></span></div>',
    );
    expect(ownsGesture(root.querySelector('#field')!, root)).toBe(true);
    expect(ownsGesture(root.querySelector('#thumb')!, root)).toBe(true);
    expect(ownsGesture(root.querySelector('#text')!, root)).toBe(false);
    root.remove();
  });

  it('reads touch-action per axis: pan-y owns sideways drags, pan-x vertical ones, none both', () => {
    const root = tree(
      '<div style="touch-action: pan-y"><span id="slider"></span></div>' +
        '<div style="touch-action: pan-x"><span id="vertical"></span></div>' +
        '<div style="touch-action: none"><span id="none"></span></div>' +
        '<div style="touch-action: pan-x pan-down pinch-zoom"><span id="scrolls"></span></div>' +
        '<p id="text">Text</p>',
    );
    const at = (id: string) => root.querySelector(`#${id}`)!;
    expect(ownsGesture(at('slider'), root, 'x')).toBe(true);
    expect(ownsGesture(at('slider'), root, 'y')).toBe(false);
    expect(ownsGesture(at('vertical'), root, 'x')).toBe(false);
    expect(ownsGesture(at('vertical'), root, 'y')).toBe(true);
    expect(ownsGesture(at('none'), root, 'x')).toBe(true);
    expect(ownsGesture(at('none'), root, 'y')).toBe(true);
    expect(ownsGesture(at('scrolls'), root, 'y')).toBe(false);
    expect(ownsGesture(at('text'), root, 'x')).toBe(false);
    root.remove();
  });

  it('leaves a sideways move to a horizontal scroller only while it can scroll that way', () => {
    const root = tree('<div id="row" style="overflow-x: auto"><span id="chip"></span></div>');
    const row = root.querySelector<HTMLElement>('#row')!;
    const chip = root.querySelector('#chip')!;
    Object.defineProperty(row, 'scrollWidth', { value: 600 });
    Object.defineProperty(row, 'clientWidth', { value: 300 });
    // At its start: a finger moving right (toward the start) can't scroll it, one moving left can.
    expect(ownsGesture(chip, root, 'x', 20)).toBe(false);
    expect(ownsGesture(chip, root, 'x', -20)).toBe(true);
    row.scrollLeft = 300;
    expect(ownsGesture(chip, root, 'x', 20)).toBe(true);
    expect(ownsGesture(chip, root, 'x', -20)).toBe(false);
    // In RTL `scrollLeft` runs from 0 (the start, on the right) to negative values.
    row.style.direction = 'rtl';
    row.scrollLeft = 0;
    expect(ownsGesture(chip, root, 'x', -20)).toBe(false);
    expect(ownsGesture(chip, root, 'x', 20)).toBe(true);
    // Before a move is decided (no `dx`), the scroller doesn't own the touch.
    expect(ownsGesture(chip, root, 'x')).toBe(false);
    root.remove();
  });

  it('reads whether the content or a scroller inside it is scrolled', () => {
    const root = tree('<div id="list"><p id="item">Item</p></div>');
    const list = root.querySelector('#list')!;
    const item = root.querySelector('#item')!;
    expect(scrolledAbove(item, root)).toBe(false);
    list.scrollTop = 40;
    expect(scrolledAbove(item, root)).toBe(true);
    list.scrollTop = 0;
    root.scrollTop = 40;
    expect(scrolledAbove(item, root)).toBe(true);
    root.remove();
  });
});

describe('sideSwipeGesture', () => {
  it('stays undecided within the slop', () => {
    expect(sideSwipeGesture(DRAG_SLOP, -DRAG_SLOP, 'end', 'ltr')).toBe('undecided');
  });

  it('leaves a move more vertical than sideways to the browser, which scrolls', () => {
    expect(sideSwipeGesture(6, 12, 'end', 'ltr')).toBe('scroll');
    expect(sideSwipeGesture(-6, -12, 'start', 'rtl')).toBe('scroll');
  });

  it('drags toward the edge and ignores moves away from it, for both edges and directions', () => {
    // The end edge is the right in LTR, the left in RTL; the start edge the other way.
    const cases = [
      ['end', 'ltr', 12],
      ['end', 'rtl', -12],
      ['start', 'ltr', -12],
      ['start', 'rtl', 12],
    ] as const;
    for (const [edge, direction, toward] of cases) {
      expect(edgeSign(edge, direction)).toBe(Math.sign(toward));
      expect(sideSwipeGesture(toward, 3, edge, direction)).toBe('drag');
      expect(sideSwipeGesture(-toward, 3, edge, direction)).toBe('ignore');
    }
  });
});

describe('releaseVelocity', () => {
  it('reads a slow drag that ends in a flick as a fling', () => {
    // 100px over 900ms, then 40px in the last 50ms.
    const samples = [
      { position: 0, time: 0 },
      { position: 50, time: 450 },
      { position: 100, time: 900 },
      { position: 120, time: 925 },
      { position: 140, time: 950 },
    ];
    // Over the whole drag it would be about 147px/s; the last 100ms say 800px/s.
    expect(releaseVelocity(samples)).toBeCloseTo(800);
  });

  it('is zero for a drag that stops before lifting, or a single sample', () => {
    expect(
      releaseVelocity([
        { position: 0, time: 0 },
        { position: 80, time: 100 },
        { position: 80, time: 400 },
      ]),
    ).toBe(0);
    expect(releaseVelocity([{ position: 10, time: 5 }])).toBe(0);
    expect(releaseVelocity([])).toBe(0);
  });
});
