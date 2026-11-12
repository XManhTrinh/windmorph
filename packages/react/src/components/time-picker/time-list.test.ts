import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { listTimes, nearestTime } from './time-list';

const texts = (times: Time[]) => times.map((time) => time.toString().slice(0, 5));

describe('listTimes', () => {
  it('lists every step of the day from midnight', () => {
    const times = listTimes(30, undefined, undefined, null);
    expect(times).toHaveLength(48);
    expect(texts(times).slice(0, 3)).toEqual(['00:00', '00:30', '01:00']);
    expect(texts(times).at(-1)).toBe('23:30');
  });

  it('keeps to min and max, both included', () => {
    expect(texts(listTimes(60, new Time(9, 0), new Time(12, 0), null))).toEqual([
      '09:00',
      '10:00',
      '11:00',
      '12:00',
    ]);
    // A bound between two steps leaves out the step before it.
    expect(texts(listTimes(30, new Time(9, 10), new Time(10, 20), null))).toEqual([
      '09:30',
      '10:00',
    ]);
  });

  it('lists a value between two steps in its place, unless it is out of range', () => {
    expect(texts(listTimes(60, new Time(9, 0), new Time(11, 0), new Time(9, 40)))).toEqual([
      '09:00',
      '09:40',
      '10:00',
      '11:00',
    ]);
    expect(texts(listTimes(60, new Time(9, 0), new Time(11, 0), new Time(8, 15)))).toEqual([
      '09:00',
      '10:00',
      '11:00',
    ]);
  });

  it('never lists fewer than one time, or more than a five-minute step gives', () => {
    expect(texts(listTimes(30, new Time(9, 10), new Time(9, 20), null))).toEqual(['09:10']);
    expect(listTimes(1, undefined, undefined, null)).toHaveLength(288);
    expect(listTimes(Number.NaN, undefined, undefined, null)).toHaveLength(288);
  });
});

describe('nearestTime', () => {
  it('finds the listed time nearest a minute of the day, the earlier one on a tie', () => {
    const times = listTimes(30, undefined, undefined, null);
    expect(nearestTime(times, 9 * 60 + 10)?.toString()).toBe('09:00:00');
    expect(nearestTime(times, 9 * 60 + 20)?.toString()).toBe('09:30:00');
    expect(nearestTime(times, 9 * 60 + 15)?.toString()).toBe('09:00:00');
    expect(nearestTime([], 0)).toBeUndefined();
  });
});
