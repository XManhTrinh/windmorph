// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { pullToRefreshStyles } from './pull-to-refresh-styles';

function* outputs() {
  const slots = pullToRefreshStyles();
  yield slots.root();
  yield slots.layer();
  yield slots.clip();
  yield slots.indicator();
  yield slots.face();
}

describe('pullToRefreshStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./pull-to-refresh-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
