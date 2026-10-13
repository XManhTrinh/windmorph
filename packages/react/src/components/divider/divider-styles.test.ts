// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { dividerStyles } from './divider-styles';

describe('dividerStyles', () => {
  function* outputs() {
    for (const orientation of ['horizontal', 'vertical'] as const)
      for (const inset of ['none', 'start', 'middle'] as const)
        yield dividerStyles({ orientation, inset });
  }
  const classes = collectClasses(outputs());

  it('writes every class literally and compiles', async () => {
    expect(
      await nonLiteralClasses(new URL('./divider-styles.ts', import.meta.url), classes),
    ).toEqual([]);
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
