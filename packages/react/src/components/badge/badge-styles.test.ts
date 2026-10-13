// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { badgedBoxStyles, badgeStyles } from './badge-styles';

describe('badge styles', () => {
  function* outputs() {
    for (const size of ['small', 'large'] as const) {
      yield badgeStyles({ size });
      const slots = badgedBoxStyles({ size });
      for (const slot of Object.values(slots)) yield slot();
    }
  }
  const classes = collectClasses(outputs());

  it('writes every class literally and compiles', async () => {
    expect(await nonLiteralClasses(new URL('./badge-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
