// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { textFieldStyles } from './text-field-styles';

function* outputs() {
  for (const variant of ['filled', 'outlined'] as const)
    for (const hasLabel of [false, true])
      for (const hasLeadingIcon of [false, true])
        for (const hasTrailingIcon of [false, true])
          for (const multiline of [false, true]) {
            const slots = textFieldStyles({
              variant,
              hasLabel,
              hasLeadingIcon,
              hasTrailingIcon,
              multiline,
            });
            for (const slot of Object.values(slots)) yield slot();
          }
}

describe('textFieldStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./text-field-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
