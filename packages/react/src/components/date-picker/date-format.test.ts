// @vitest-environment node
import { CalendarDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { dateFormat, parseDate } from './date-format';

describe('dateFormat', () => {
  it('follows the locale: order, hint and output', () => {
    const us = dateFormat('en-US');
    expect(us.order).toEqual(['month', 'day', 'year']);
    expect(us.hint).toBe('MM/DD/YYYY');
    expect(us.format(new CalendarDate(2030, 3, 4))).toBe('03/04/2030');
    expect(dateFormat('en-GB').hint).toBe('DD/MM/YYYY');
    expect(dateFormat('de-DE').hint).toBe('DD.MM.YYYY');
    expect(dateFormat('ja-JP').order).toEqual(['year', 'month', 'day']);
  });

  it('writes Gregorian dates in Latin digits whatever the locale', () => {
    expect(dateFormat('ar-EG').format(new CalendarDate(2030, 3, 4))).toMatch(/04.*03.*2030/);
    expect(dateFormat('th-TH').format(new CalendarDate(2030, 3, 4))).toContain('2030');
  });
});

describe('parseDate', () => {
  const order = dateFormat('en-US').order;
  const march14 = new CalendarDate(2030, 3, 14);

  it('accepts dashes, spaces, slashes, dots and missing leading zeros', () => {
    for (const text of [
      '03/14/2030',
      '3/14/2030',
      '3-14-2030',
      '3 14 2030',
      '3.14.2030',
      ' 03 - 14 - 2030 ',
    ]) {
      expect(parseDate(text, order)).toEqual(march14);
    }
  });

  it('reads eight digits with no separators and a two-digit year', () => {
    expect(parseDate('03142030', order)).toEqual(march14);
    expect(parseDate('3/14/30', order, 2026)).toEqual(march14);
    expect(parseDate('3/14/99', order, 2026)).toEqual(new CalendarDate(1999, 3, 14));
  });

  it('follows the locale order', () => {
    expect(parseDate('14.3.2030', dateFormat('de-DE').order)).toEqual(march14);
    expect(parseDate('2030/3/14', dateFormat('ja-JP').order)).toEqual(march14);
  });

  it('turns away text that is not a real date', () => {
    for (const text of ['', '3/14', '13/14/2030', '2/30/2030', '3/14/203', '003/14/2030', 'soon']) {
      expect(parseDate(text, order)).toBe(null);
    }
  });
});
