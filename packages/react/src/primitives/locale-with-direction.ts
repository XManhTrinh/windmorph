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
    // Only the settings the new script would change go into the tag. Never a numbering system:
    // in the tag it stops React Aria's number parser from reading other digits, so an app's own
    // number or date-segment input in the region would refuse Latin digits on an Arabic page.
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
 * locale's script (`isRTL`): the script changes (`en-US` → `en-Arab-US` for RTL, `ar` →
 * `ar-Latn` for LTR) and the language and region stay. A new script can change how the locale
 * formats, so the tag keeps the original's hour cycle and calendar wherever it would
 * (`zh-Hant-TW` → `zh-Arab-TW-u-hc-h12` for right to left, still a 12-hour clock), and only
 * those. It doesn't keep the digits (`ar-EG` → `ar-Latn-EG`, Latin digits): a numbering system
 * in the tag would stop React Aria's number parser reading other digits, so an app's own React
 * Aria number or date-segment input in a left-to-right region of an Arabic page would refuse
 * Latin ones. An app's own `-u-nu-` keyword stays. No tag with another script keeps the rest of
 * a locale's own data, which then comes from its language's: words written in its script
 * (Serbian's Latin month names come out Cyrillic) and a region's own patterns and separators
 * (`en-GB`'s day-first dates, `es-MX`'s decimal point). So the tag is for React Aria only:
 * `DomDirectionLocale` keeps the original for the components' own dates, times and numbers
 * (their digits included) and for `useLocale`, and only React Aria's own words and formats there
 * (a calendar day's accessible name) follow the tag. A locale that can't be read gives `ar` or
 * `en-US`.
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
