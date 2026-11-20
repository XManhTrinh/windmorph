/*
 * A media's times (docs/plans/duration-formatting.md): a clock for the eye (`1:23`, `1:02:03`)
 * and words for assistive technology (`1 minute, 23 seconds`), both in the locale's digits,
 * units and list style. Shared by `ListItemVideo` and Windmorph Pro's media parts, so a length
 * is said the same way everywhere. Formatters are cached per locale, since a drag formats a
 * time on every move.
 */

const clockFormats = new Map<string, { plain: Intl.NumberFormat; padded: Intl.NumberFormat }>();

function clockFormat(locale: string) {
  let format = clockFormats.get(locale);
  if (!format) {
    format = {
      plain: new Intl.NumberFormat(locale, { useGrouping: false }),
      padded: new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: 2 }),
    };
    clockFormats.set(locale, format);
  }
  return format;
}

// Whole seconds split into hours, minutes and seconds (a negative or invalid time is 0).
function parts(seconds: number) {
  const whole = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return {
    hours: Math.floor(whole / 3600),
    minutes: Math.floor((whole % 3600) / 60),
    seconds: whole % 60,
  };
}

/**
 * A time as a clock: `m:ss`, or `h:mm:ss` from an hour or with `hours` (a media an hour or
 * longer, so every time of it has the same shape). Whole seconds, rounded down; a negative or
 * invalid time is 0.
 */
export function formatClock(seconds: number, locale: string, hours = false): string {
  const { plain, padded } = clockFormat(locale);
  const time = parts(seconds);
  return hours || time.hours > 0
    ? `${plain.format(time.hours)}:${padded.format(time.minutes)}:${padded.format(time.seconds)}`
    : `${plain.format(time.minutes)}:${padded.format(time.seconds)}`;
}

const wordFormats = new Map<
  string,
  {
    hour: Intl.NumberFormat;
    minute: Intl.NumberFormat;
    second: Intl.NumberFormat;
    list: Intl.ListFormat;
  }
>();

function wordFormat(locale: string) {
  let format = wordFormats.get(locale);
  if (!format) {
    const unit = (name: 'hour' | 'minute' | 'second') =>
      new Intl.NumberFormat(locale, { style: 'unit', unit: name, unitDisplay: 'long' });
    format = {
      hour: unit('hour'),
      minute: unit('minute'),
      second: unit('second'),
      list: new Intl.ListFormat(locale, { type: 'unit', style: 'long' }),
    };
    wordFormats.set(locale, format);
  }
  return format;
}

/**
 * A time in words, leaving out units at 0: `1 hour, 2 seconds`; no time is `0 seconds`. Whole
 * seconds, rounded down; a negative or invalid time is 0.
 */
export function formatDurationWords(seconds: number, locale: string): string {
  const format = wordFormat(locale);
  const time = parts(seconds);
  const words = [
    time.hours > 0 && format.hour.format(time.hours),
    time.minutes > 0 && format.minute.format(time.minutes),
    (time.seconds > 0 || (time.hours === 0 && time.minutes === 0)) &&
      format.second.format(time.seconds),
  ].filter((word): word is string => typeof word === 'string');
  return format.list.format(words);
}
