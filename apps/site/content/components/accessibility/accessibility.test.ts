import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../catalog';
import { ACCESSIBILITY } from '.';
import { ACCESSIBILITY_SECTIONS, isNotApplicable, type NotApplicable } from './types';

/** A reason worth reading: a sentence, not a placeholder. */
function expectReason(value: NotApplicable, where: string) {
  expect(value.none.trim().length, `${where}: the reason is too short`).toBeGreaterThan(15);
  expect(value.none.trim(), `${where}: the reason ends a sentence`).toMatch(/[.)]$/);
}

function expectSentences(list: readonly string[], where: string) {
  expect(list.length, `${where}: empty list (use { none: reason } instead)`).toBeGreaterThan(0);
  for (const text of list) expect(text.trim(), `${where}: blank entry`).not.toBe('');
}

describe('component accessibility data', () => {
  it('covers every component page, and nothing else', () => {
    expect(Object.keys(ACCESSIBILITY).sort()).toEqual(COMPONENT_META.map((m) => m.slug).sort());
  });

  describe.each(COMPONENT_META.map((meta) => meta.slug))('%s', (slug) => {
    const data = ACCESSIBILITY[slug]!;

    it('has every section, or "None" with a reason', () => {
      for (const { key } of ACCESSIBILITY_SECTIONS) {
        const value = data[key];
        const where = `${slug} ${key}`;
        expect(value, `${where} is missing`).toBeDefined();
        if (isNotApplicable(value)) {
          expectReason(value, where);
        } else if (key === 'keyboard') {
          expect(Array.isArray(value), where).toBe(true);
          const rows = data.keyboard as readonly { keys: readonly string[]; action: string }[];
          expect(rows.length, `${where}: no keys (use { none: reason } instead)`).toBeGreaterThan(
            0,
          );
          for (const row of rows) {
            expect(row.keys.length, `${where}: a row without keys`).toBeGreaterThan(0);
            expect(row.action.trim(), `${where}: a row without an action`).not.toBe('');
          }
        } else if (key === 'screenReader') {
          const info = data.screenReader as { role: string; name: string; states: string };
          for (const part of ['role', 'name', 'states'] as const) {
            expect(info[part].trim(), `${where}: ${part} is blank`).not.toBe('');
          }
        } else {
          expectSentences(value as readonly string[], where);
        }
      }
    });
  });
});
