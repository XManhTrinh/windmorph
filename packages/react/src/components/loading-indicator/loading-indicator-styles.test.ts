// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { loadingIndicatorStyles } from './loading-indicator-styles';

function* outputs() {
  for (const variant of ['default', 'contained'] as const) {
    const slots = loadingIndicatorStyles({ variant });
    yield slots.root();
    yield slots.indicator();
  }
}

describe('loadingIndicatorStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./loading-indicator-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
