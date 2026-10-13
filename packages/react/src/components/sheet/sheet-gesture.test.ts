import { describe, expect, it } from 'vitest';
import { contentGesture, DRAG_SLOP, ownsGesture, scrolledAbove } from './sheet-gesture';

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

  it('scrolls on an upward move, even at the top', () => {
    expect(contentGesture(0, -12, false)).toBe('scroll');
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
