// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { switchStyles } from './switch-styles';

describe('switchStyles', () => {
  const classes = collectClasses(Object.values(switchStyles()).map((slot) => slot()));

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./switch-styles.ts', import.meta.url),
          new URL('../../primitives/selection-control-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('uses the track control, not the 40px circle', () => {
    const control = switchStyles().control();
    expect(control).toContain('w-[52px]');
    expect(control).not.toContain('size-[40px]');
    expect(control).not.toContain('state-layer');
  });
});
