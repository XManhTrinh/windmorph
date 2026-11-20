import { describe, expect, it } from 'vitest';
import { formatClock, formatDurationWords } from './format-duration';

describe('formatClock', () => {
  it('writes m:ss, and h:mm:ss for an hour or more', () => {
    expect(formatClock(0, 'en-US')).toBe('0:00');
    expect(formatClock(83.9, 'en-US')).toBe('1:23');
    expect(formatClock(600, 'en-US')).toBe('10:00');
    expect(formatClock(3723, 'en-US')).toBe('1:02:03');
    // A media an hour long gives every time the same shape.
    expect(formatClock(65, 'en-US', true)).toBe('0:01:05');
  });

  it('treats a negative or unknown time as 0, and uses the locale’s digits', () => {
    expect(formatClock(-4, 'en-US')).toBe('0:00');
    expect(formatClock(Number.NaN, 'en-US')).toBe('0:00');
    expect(formatClock(83, 'ar-EG')).toBe('١:٢٣');
  });
});

describe('formatDurationWords', () => {
  it('names each unit that isn’t 0, in the locale’s words', () => {
    expect(formatDurationWords(0, 'en-US')).toBe('0 seconds');
    expect(formatDurationWords(1, 'en-US')).toBe('1 second');
    expect(formatDurationWords(83, 'en-US')).toBe('1 minute, 23 seconds');
    expect(formatDurationWords(3602, 'en-US')).toBe('1 hour, 2 seconds');
    expect(formatDurationWords(5400, 'en-US')).toBe('1 hour, 30 minutes');
    expect(formatDurationWords(83, 'de-DE')).toBe('1 Minute, 23 Sekunden');
  });
});
