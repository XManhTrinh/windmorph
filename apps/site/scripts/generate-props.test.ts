import { describe, expect, it } from 'vitest';
import { enumOptionsFromType } from './generate-props';

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
