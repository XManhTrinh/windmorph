import { describe, expect, it } from 'vitest';
import { matchesShortcut } from './shortcut';

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
