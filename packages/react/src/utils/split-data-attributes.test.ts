import { describe, expect, it } from 'vitest';
import { splitDataAttributes } from './split-data-attributes';

describe('splitDataAttributes', () => {
  it('separates data-* attributes from other props', () => {
    const { data, rest } = splitDataAttributes({
      'data-testid': 'x',
      'data-state': 'open',
      'aria-label': 'Name',
      name: 'n',
    });
    expect(data).toEqual({ 'data-testid': 'x', 'data-state': 'open' });
    expect(rest).toEqual({ 'aria-label': 'Name', name: 'n' });
  });
});
