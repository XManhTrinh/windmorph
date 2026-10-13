import { describe, expect, it } from 'vitest';
import { getThemeFromCookies } from '../next/get-theme-from-cookies';
import {
  DEFAULT_THEME_STATE,
  parseThemeState,
  serializeThemeState,
  themeAttributes,
} from './state';

const state = { theme: 'ocean', mode: 'dark', contrast: 'high', motion: 'standard' } as const;

describe('theme state', () => {
  it('round-trips through serialisation', () => {
    expect(parseThemeState(serializeThemeState(state))).toEqual(state);
  });

  it('drops invalid or disallowed values', () => {
    const raw = encodeURIComponent('theme=Bad Name&mode=sepia&contrast=high&motion=wild');
    expect(parseThemeState(raw)).toEqual({ contrast: 'high' });
    expect(parseThemeState(serializeThemeState(state), ['baseline'])).not.toHaveProperty('theme');
    expect(parseThemeState('%E0%A4%A')).toEqual({});
    expect(parseThemeState(undefined)).toEqual({});
  });

  it('maps state to data attributes', () => {
    expect(themeAttributes(state)).toEqual({
      'data-theme': 'ocean',
      'data-mode': 'dark',
      'data-contrast': 'high',
      'data-motion': 'standard',
    });
  });
});

describe('getThemeFromCookies', () => {
  it('reads a Next cookie store', () => {
    const store = {
      get: (name: string) =>
        name === 'windmorph-theme' ? { value: serializeThemeState(state) } : undefined,
    };
    expect(getThemeFromCookies(store)).toEqual(state);
  });

  it('reads a raw Cookie header and a custom key', () => {
    const header = `a=1; my-theme=${serializeThemeState(state)}; b=2`;
    expect(getThemeFromCookies(header, { storageKey: 'my-theme' })).toEqual(state);
  });

  it('falls back to defaults when nothing valid is stored', () => {
    expect(getThemeFromCookies(undefined)).toEqual(DEFAULT_THEME_STATE);
    expect(getThemeFromCookies('', { defaults: { theme: 'forest', mode: 'light' } })).toEqual({
      ...DEFAULT_THEME_STATE,
      theme: 'forest',
      mode: 'light',
    });
  });
});
