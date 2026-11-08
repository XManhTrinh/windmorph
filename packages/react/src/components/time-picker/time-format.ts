import { Time } from '@internationalized/date';

/** Any day: only the time of day is read, and this one has no clock change. */
const at = (time: Time) => new Date(2000, 0, 15, time.hour, time.minute);

/** Formats a time on the given clock. */
export function formatTime(time: Time, locale: string, hourCycle: 12 | 24): string {
  return new Intl.DateTimeFormat(locale, {
    hour: hourCycle === 24 ? '2-digit' : 'numeric',
    minute: '2-digit',
    hourCycle: hourCycle === 24 ? 'h23' : 'h12',
  }).format(at(time));
}

/** The locale's words for morning and afternoon, in lower case. */
function dayPeriods(locale: string) {
  const period = (hour: number) =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
      .formatToParts(new Date(2000, 0, 15, hour))
      .find((part) => part.type === 'dayPeriod')
      ?.value.toLowerCase();
  return { am: period(9), pm: period(21) };
}

/** The first digit of the decimal digit sets people commonly type or paste. */
const DIGIT_ZEROS = [0x0660, 0x06f0, 0x0966, 0x0e50, 0xff10];

function toLatinDigits(text: string) {
  return text.replace(/\p{Nd}/gu, (digit) => {
    const code = digit.codePointAt(0)!;
    const zero = DIGIT_ZEROS.find((start) => code >= start && code <= start + 9);
    return zero === undefined ? digit : String(code - zero);
  });
}

/**
 * Reads a time as people type or paste it: `9`, `930`, `0930`, `9:30`, `9.30`, `9h30`,
 * `21:30`, `9pm`, `9:30 pm`. Returns `null` for anything else, such as `9:3`, which could be
 * 9:03 or 9:30.
 */
export function parseTimeText(text: string, locale: string): Time | null {
  let rest = toLatinDigits(text).trim().toLowerCase();
  const local = dayPeriods(locale);
  let period: 'am' | 'pm' | null = null;
  for (const [name, word] of [
    ['am', local.am],
    ['pm', local.pm],
  ] as const) {
    if (word && /\p{L}/u.test(word) && rest.includes(word)) {
      period = name;
      rest = rest.replace(word, '').trim();
    }
  }
  if (period === null) {
    const latin = /\s*([ap])\.?(?:m\.?)?$/.exec(rest);
    if (latin) {
      period = latin[1] === 'a' ? 'am' : 'pm';
      rest = rest.slice(0, latin.index);
    }
  }
  rest = rest.replace(/h$/, '');

  let hour: number;
  let minute = 0;
  const separated = /^(\d{1,2})[:.h\s](\d{2})(?:[:.]\d{2})?$/.exec(rest);
  if (separated) {
    hour = Number(separated[1]);
    minute = Number(separated[2]);
  } else if (/^\d{1,2}$/.test(rest)) {
    hour = Number(rest);
  } else if (/^\d{3,4}$/.test(rest)) {
    hour = Number(rest.slice(0, -2));
    minute = Number(rest.slice(-2));
  } else {
    return null;
  }
  if (minute > 59) return null;
  if (period !== null) {
    if (hour === 0 || hour > 23) return null;
    if (hour > 12) {
      // "21:30 pm" says the same thing twice; "13 am" contradicts itself.
      if (period === 'am') return null;
    } else {
      hour = (hour % 12) + (period === 'pm' ? 12 : 0);
    }
  }
  if (hour > 23) return null;
  return new Time(hour, minute);
}
