// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { richTooltipStyles, tooltipStyles } from './tooltip-styles';

function* outputs() {
  for (const slot of Object.values(tooltipStyles())) yield slot();
  for (const spaced of [false, true])
    for (const slot of Object.values(richTooltipStyles({ spaced }))) yield slot();
}

describe('tooltip styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./tooltip-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
