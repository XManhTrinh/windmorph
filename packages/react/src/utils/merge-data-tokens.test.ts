import { describe, expect, it } from 'vitest';
import { mergeDataTokens } from './merge-data-tokens';

describe('mergeDataTokens', () => {
  it("keeps the component's own set when nothing is passed", () => {
    expect(mergeDataTokens('md-comp-card')).toBe('md-comp-card');
    expect(mergeDataTokens('md-comp-card', null)).toBe('md-comp-card');
    expect(mergeDataTokens('md-comp-card', { 'data-variant': 'filled' })).toBe('md-comp-card');
    expect(mergeDataTokens('md-comp-card', { 'data-tokens': '  ' })).toBe('md-comp-card');
  });

  it("appends an incoming set after the component's own", () => {
    expect(mergeDataTokens('md-comp-assist-chip', { 'data-tokens': 'wm-reaction-summary' })).toBe(
      'md-comp-assist-chip wm-reaction-summary',
    );
  });

  it('splits on any whitespace and removes duplicates, keeping the first position', () => {
    expect(
      mergeDataTokens('md-comp-dialog', {
        'data-tokens': ' wm-viewer\tmd-comp-dialog  wm-viewer\napp-gallery ',
      }),
    ).toBe('md-comp-dialog wm-viewer app-gallery');
  });

  it('ignores a value that is not a string', () => {
    expect(mergeDataTokens('md-comp-menus', { 'data-tokens': true })).toBe('md-comp-menus');
    expect(mergeDataTokens('md-comp-menus', { 'data-tokens': 3 })).toBe('md-comp-menus');
  });
});
