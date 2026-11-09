import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { localeHourCycle } from './hour-cycle';
import { formatTime, parseTimeText } from './time-format';

const read = (text: string, locale = 'en-US') =>
  parseTimeText(text, locale)?.toString().slice(0, 5);

describe('parseTimeText', () => {
  it.each([
    ['9', '09:00'],
    ['930', '09:30'],
    ['0930', '09:30'],
    ['9:30', '09:30'],
    ['9.30', '09:30'],
    ['9h30', '09:30'],
    ['9h', '09:00'],
    ['21:30', '21:30'],
    ['2130', '21:30'],
    ['9pm', '21:00'],
    ['9 PM', '21:00'],
    ['9:30 pm', '21:30'],
    ['9:30p', '21:30'],
    ['9:30 p.m.', '21:30'],
    ['930am', '09:30'],
    ['12am', '00:00'],
    ['12:30 am', '00:30'],
    ['12pm', '12:00'],
    ['21:30 pm', '21:30'],
    ['0', '00:00'],
    ['00:00', '00:00'],
    ['23:59', '23:59'],
    [' 9:30 ', '09:30'],
    ['09:30:15', '09:30'],
  ])('reads %s as %s', (text, expected) => {
    expect(read(text)).toBe(expected);
  });

  it.each(['', 'soon', '25', '24:00', '9:60', '9:3', '12345', '13am', '0pm', ':30', '9:30:1'])(
    'refuses %j',
    (text) => {
      expect(read(text)).toBeUndefined();
    },
  );

  it('reads the locale’s digits and day periods', () => {
    expect(read('٩:٣٠', 'ar')).toBe('09:30');
    expect(read('9:30 ochtend', 'en-US')).toBeUndefined();
    const korean = new Intl.DateTimeFormat('ko', { hour: 'numeric', hourCycle: 'h12' })
      .formatToParts(new Date(2000, 0, 15, 21))
      .find((part) => part.type === 'dayPeriod')!.value;
    expect(read(`${korean} 9:30`, 'ko')).toBe('21:30');
  });
});

describe('formatTime', () => {
  it('follows the clock it is given', () => {
    expect(formatTime(new Time(21, 5), 'en-US', 24)).toBe('21:05');
    expect(formatTime(new Time(21, 5), 'en-US', 12).replace(/\s/g, ' ')).toBe('9:05 PM');
  });
});

describe('localeHourCycle', () => {
  it('reads the locale', () => {
    expect(localeHourCycle('en-US')).toBe(12);
    expect(localeHourCycle('en-GB')).toBe(24);
  });
});
