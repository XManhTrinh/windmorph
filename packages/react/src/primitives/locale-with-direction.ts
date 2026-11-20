/** The settings a locale formats times and dates with that a new script could change. */
function formatSettings(locale: string) {
  // `hourCycle` is resolved only for a format that shows the hour.
  const { hourCycle, calendar } = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions();
  return { hourCycle, calendar };
}

function withDirection(locale: string, direction: 'ltr' | 'rtl'): string {
  try {
    const script = direction === 'rtl' ? 'Arab' : 'Latn';
    const kept = formatSettings(locale);
    const rescripted = formatSettings(new Intl.Locale(locale, { script }).toString());
    // Never a numbering system: React Aria's number parser would then refuse other digits.
    const options: Intl.LocaleOptions = { script };
    if (kept.hourCycle && kept.hourCycle !== rescripted.hourCycle) {
      options.hourCycle = kept.hourCycle;
    }
    if (kept.calendar !== rescripted.calendar) options.calendar = kept.calendar;
    return new Intl.Locale(locale, options).toString();
  } catch {
    return direction === 'rtl' ? 'ar' : 'en-US';
  }
}

const directed = new Map<string, string>();

/**
 * The locale with the given direction, for React Aria, which reads direction only from a
 * locale's script: `en-US` → `en-Arab-US` for RTL, `ar` → `ar-Latn` for LTR. The tag keeps the
 * hour cycle and calendar the new script would change (`zh-Hant-TW` → `zh-Arab-TW-u-hc-h12`),
 * never the digits, so React Aria inputs there still read Latin ones (an app's own `-u-nu-`
 * stays). Other locale data falls back to the language's (`en-GB` dates as `en`'s), so the tag is
 * for React Aria only: `DomDirectionLocale` keeps the page's locale for the components' own
 * formatting and `useLocale`. A locale that can't be read gives `ar` or `en-US`.
 */
export function localeWithDirection(locale: string, direction: 'ltr' | 'rtl'): string {
  const key = `${direction} ${locale}`;
  let result = directed.get(key);
  if (result === undefined) {
    result = withDirection(locale, direction);
    directed.set(key, result);
  }
  return result;
}
