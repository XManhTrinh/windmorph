// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { timePickerStyles } from '../time-picker/time-picker-styles';
import { datePickerStyles, dockedDatePickerStyles } from './date-picker-styles';
import { pickerDialogStyles } from './picker-dialog-styles';

const slots = (styles: Record<string, () => string>) => Object.values(styles).map((slot) => slot());

describe('picker styles', () => {
  it('date picker classes are literal and compile', async () => {
    const classes = collectClasses([
      ...slots(datePickerStyles({ range: false })),
      ...slots(datePickerStyles({ range: true })),
      ...slots(datePickerStyles({ docked: true })),
      ...slots(dockedDatePickerStyles()),
    ]);
    expect(
      await nonLiteralClasses(new URL('./date-picker-styles.ts', import.meta.url), classes),
    ).toEqual([]);
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('picker dialog classes are literal and compile', async () => {
    const classes = collectClasses([
      ...slots(pickerDialogStyles({ variant: 'date' })),
      ...slots(pickerDialogStyles({ variant: 'time' })),
      ...slots(pickerDialogStyles({ variant: 'date', fullScreen: true })),
      ...slots(pickerDialogStyles({ variant: 'time', fullScreen: true })),
    ]);
    expect(
      await nonLiteralClasses(new URL('./picker-dialog-styles.ts', import.meta.url), classes),
    ).toEqual([]);
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('time picker classes are literal and compile', async () => {
    const classes = collectClasses(
      [12, 24].flatMap((hourCycle) =>
        (['dial', 'input'] as const).flatMap((mode) =>
          (['vertical', 'horizontal'] as const).flatMap((layout) =>
            slots(timePickerStyles({ hourCycle: hourCycle as 12 | 24, mode, layout })),
          ),
        ),
      ),
    );
    expect(
      await nonLiteralClasses(
        new URL('../time-picker/time-picker-styles.ts', import.meta.url),
        classes,
      ),
    ).toEqual([]);
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
