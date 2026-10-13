import { describe, expect, it } from 'vitest';
import { firstTabbable, matchesShortcut } from './focus';

const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

describe('matchesShortcut', () => {
  it('needs exactly the named modifiers', () => {
    expect(matchesShortcut(key({ key: 'g', code: 'KeyG', altKey: true }), 'Alt+G')).toBe(true);
    expect(matchesShortcut(key({ key: 'g', code: 'KeyG' }), 'Alt+G')).toBe(false);
    expect(
      matchesShortcut(key({ key: 'g', code: 'KeyG', altKey: true, shiftKey: true }), 'Alt+G'),
    ).toBe(false);
    expect(
      matchesShortcut(
        key({ key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true }),
        'Ctrl+Shift+K',
      ),
    ).toBe(true);
  });

  it('matches the physical key when a modifier changes the character', () => {
    expect(matchesShortcut(key({ key: '©', code: 'KeyG', altKey: true }), 'Alt+G')).toBe(true);
    expect(matchesShortcut(key({ key: '¡', code: 'Digit1', altKey: true }), 'Alt+1')).toBe(true);
    expect(matchesShortcut(key({ key: 'Escape' }), 'Escape')).toBe(true);
  });
});

describe('firstTabbable', () => {
  it('skips disabled, untabbable, inert and hidden elements', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button disabled>a</button>
      <span tabindex="-1">b</span>
      <div inert><button>c</button></div>
      <div hidden><button>d</button></div>
      <a href="#x">e</a>`;
    expect(firstTabbable(root)?.textContent).toBe('e');
    expect(firstTabbable(document.createElement('div'))).toBeNull();
  });
});
