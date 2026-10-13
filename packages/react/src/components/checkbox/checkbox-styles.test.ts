// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { checkboxStyles } from './checkbox-styles';

describe('checkboxStyles', () => {
  const slots = checkboxStyles();
  const classes = collectClasses(Object.values(slots).map((slot) => slot()));

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./checkbox-styles.ts', import.meta.url),
          new URL('../../primitives/selection-control-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
