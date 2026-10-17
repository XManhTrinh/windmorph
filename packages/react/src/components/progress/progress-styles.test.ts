// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { circularProgressStyles, linearProgressStyles } from './progress-styles';

function* outputs() {
  for (const wavy of [false, true]) {
    for (const slot of Object.values(linearProgressStyles({ wavy }))) yield slot();
    for (const slot of Object.values(circularProgressStyles({ wavy }))) yield slot();
  }
}

describe('progress styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./progress-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
