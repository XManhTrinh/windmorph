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

  it('darkens the unselected outline to on-surface on hover, focus and press', () => {
    const box = slots.box().split(' ');
    for (const state of ['hovered', 'focus-visible', 'pressed']) {
      expect(box).toContain(`group-data-${state}/control:border-on-surface`);
    }
    // The error outline stays when an invalid box is pressed.
    expect(box).toContain('group-data-invalid/control:group-data-pressed/control:border-error');
  });

  it('keeps an invalid box\'s state layer error when it is selected or pressed', () => {
    const control = slots.control().split(' ');
    const error = '[--m3-state-layer-color:var(--md-sys-color-error)]';
    // Each invalid rule is at least as specific as the selected / pressed rule it must beat.
    for (const variant of [
      'data-invalid:',
      'data-invalid:data-selected:',
      'data-invalid:data-pressed:',
      'data-invalid:data-selected:data-pressed:',
    ]) {
      expect(control).toContain(`${variant}${error}`);
    }
  });

  it('gives selected boxes no outline, invalid included', () => {
    const box = slots.box().split(' ');
    expect(box).toContain('group-data-selected/control:border-transparent');
    expect(box).not.toContain('group-data-selected/control:border-primary');
    expect(box).toContain(
      'group-data-invalid/control:group-data-pressed/control:group-data-selected/control:border-transparent',
    );
  });
});
