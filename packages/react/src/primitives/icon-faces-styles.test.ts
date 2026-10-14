// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { collectClasses, nonLiteralClasses, uncompiledClasses } from '../../test/tailwind-classes';
import { iconFacesStyles } from './icon-faces-styles';

function* outputs() {
  for (const transition of ['swap', 'rotate'] as const)
    for (const face of ['primary', 'alternate'] as const) {
      const slots = iconFacesStyles({ transition, face });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('iconFacesStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./icon-faces-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('turns the faces in opposite directions, mirrored in RTL, only with motion allowed', () => {
    const primary = iconFacesStyles({ transition: 'rotate', face: 'primary' }).face();
    const alternate = iconFacesStyles({ transition: 'rotate', face: 'alternate' }).face();
    expect(primary).toContain(
      'motion-safe:not-data-active:ltr:-rotate-90 motion-safe:not-data-active:rtl:rotate-90',
    );
    expect(alternate).toContain(
      'motion-safe:not-data-active:ltr:rotate-90 motion-safe:not-data-active:rtl:-rotate-90',
    );
    for (const face of [primary, alternate]) {
      // The shown face doesn't turn, so reduced motion has no rotation to run.
      expect(face).not.toMatch(/(^| )(data-active:)?rotate-/);
      expect(face).not.toContain('invisible');
    }
  });

  it('swaps by default, without rotating or fading', () => {
    const face = iconFacesStyles().face();
    expect(face).toContain('invisible data-active:visible');
    expect(face).not.toMatch(/rotate|opacity/);
  });
});
