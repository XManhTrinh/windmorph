import { CalendarDate } from '@internationalized/date';

/*
 * Typed date entry, as the M3 date picker accessibility guidance asks: no input mask, any
 * of dashes, spaces, slashes or dots between the parts, an optional leading zero on the
 * month and day, and the date reformatted only once the person is done (Enter or leaving
 * the field). The order of the parts and the format hint ("MM/DD/YYYY") come from the
 * locale's numeric date format, always in the Gregorian calendar with Latin digits so
 * what is shown can be typed back.
 */

type Part = 'day' | 'month' | 'year';

export interface DateFormat {
  /** The order the locale writes the parts in, e.g. month, day, year for `en-US`. */
  order: Part[];
  /** The format hint, e.g. "MM/DD/YYYY" (`en-US`) or "DD.MM.YYYY" (`de-DE`). */
  hint: string;
  /** Writes a date in the locale's numeric format, e.g. "03/14/2030". */
  format: (date: CalendarDate) => string;
}

const HINT: Record<Part, string> = { day: 'DD', month: 'MM', year: 'YYYY' };
const SAMPLE = Date.UTC(2000, 10, 22);
const cache = new Map<string, DateFormat>();

/** The numeric date format of `locale`. */
export function dateFormat(locale: string): DateFormat {
  const cached = cache.get(locale);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'UTC',
  });
  const parts = formatter.formatToParts(SAMPLE);
  const order = parts
    .map((part) => part.type)
    .filter((type): type is Part => type === 'day' || type === 'month' || type === 'year');
  const hint = parts
    .map((part) => (part.type === 'literal' ? part.value : (HINT[part.type as Part] ?? '')))
    .join('')
    // Bidi marks some locales put around the parts; the hint is read, not typed back.
    .replace(/[‎‏؜]/g, '')
    .trim();
  const result: DateFormat = {
    order,
    hint,
    format: (date) => formatter.format(Date.UTC(date.year, date.month - 1, date.day)),
  };
  cache.set(locale, result);
  return result;
}

/** A two-digit year in the window from 80 years ago to 19 years ahead. */
function expandYear(year: number, digits: number, thisYear: number) {
  if (digits > 2) return year;
  const century = Math.floor(thisYear / 100) * 100;
  const candidate = century + year;
  return candidate > thisYear + 19 ? candidate - 100 : candidate;
}

/**
 * Reads a typed date in the locale's part order. Returns `null` when the text isn't a
 * real date. Accepts any non-digit separators ("3-14-2030", "03 14 2030", "3.14.2030"),
 * eight digits with none ("03142030"), and a two-digit year.
 */
export function parseDate(
  text: string,
  order: Part[],
  thisYear = new Date().getFullYear(),
): CalendarDate | null {
  let numbers: string[] = text.match(/\d+/g) ?? [];
  if (numbers.length === 1 && numbers[0]!.length === 8) {
    const digits = numbers[0]!;
    let offset = 0;
    numbers = order.map((part) => {
      const width = part === 'year' ? 4 : 2;
      const slice = digits.slice(offset, offset + width);
      offset += width;
      return slice;
    });
  }
  if (numbers.length !== 3 || order.length !== 3) return null;
  const values: Partial<Record<Part, number>> = {};
  for (const [index, part] of order.entries()) {
    const token = numbers[index]!;
    if (part !== 'year' && token.length > 2) return null;
    if (part === 'year' && token.length !== 2 && token.length !== 4) return null;
    const value = Number(token);
    values[part] = part === 'year' ? expandYear(value, token.length, thisYear) : value;
  }
  const { year = 0, month = 0, day = 0 } = values;
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const first = new CalendarDate(year, month, 1);
  if (day > first.calendar.getDaysInMonth(first)) return null;
  return new CalendarDate(year, month, day);
}
