import { describe, expect, it } from 'vitest';
import { enumOptionsFromType, enumValuesFromType, normalizeDefaultValue } from './generate-props';

describe('enumOptionsFromType', () => {
  it('extracts string-literal union members with quotes stripped', () => {
    const options = enumOptionsFromType({
      name: 'enum',
      value: [{ value: '"filled"' }, { value: '"outlined"' }, { value: '"text"' }],
    });
    expect(options).toEqual(['filled', 'outlined', 'text']);
  });

  it('drops an `undefined` member (from optional unions)', () => {
    const options = enumOptionsFromType({
      name: 'enum',
      value: [{ value: '"sm"' }, { value: 'undefined' }],
    });
    expect(options).toEqual(['sm']);
  });

  it('returns undefined for a non-enum type', () => {
    expect(enumOptionsFromType({ name: 'boolean' })).toBeUndefined();
    expect(enumOptionsFromType({ name: 'string' })).toBeUndefined();
    expect(enumOptionsFromType(undefined)).toBeUndefined();
  });

  it('returns undefined for an enum with no usable members', () => {
    expect(enumOptionsFromType({ name: 'enum', value: [{ value: 'undefined' }] })).toBeUndefined();
  });
});

describe('enumValuesFromType', () => {
  it('keeps each member as written, so strings and numbers stay apart', () => {
    const values = enumValuesFromType({
      name: 'enum',
      value: [{ value: '"sm"' }, { value: '1' }, { value: 'undefined' }],
    });
    expect(values).toEqual(['"sm"', '1']);
  });

  it('returns undefined for a non-enum type', () => {
    expect(enumValuesFromType({ name: 'string' })).toBeUndefined();
  });
});

describe('normalizeDefaultValue', () => {
  it("collapses one default repeated by a union's members to a single value", () => {
    // Button's `variant` is declared in its action, link and toggle forms.
    expect(normalizeDefaultValue('"filled"\n"filled"')).toBe('"filled"');
    expect(normalizeDefaultValue('"sm"\n"sm"\n"sm"')).toBe('"sm"');
  });

  it('keeps a single-line default as it is', () => {
    expect(normalizeDefaultValue('0.15')).toBe('0.15');
  });

  it('keeps a default that genuinely spans several lines', () => {
    const raw = '{ start: 16, end: 16 } (uncontained: no end padding;\nfull-screen: none)';
    expect(normalizeDefaultValue(raw)).toBe(raw);
  });
});
