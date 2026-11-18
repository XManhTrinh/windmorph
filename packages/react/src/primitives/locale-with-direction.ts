/** The settings a locale formats numbers and times with. */
function formatSettings(locale: string) {
  const { numberingSystem } = new Intl.NumberFormat(locale).resolvedOptions();
  // `hourCycle` is resolved only for a format that shows the hour.
  const { hourCycle, calendar } = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions();
  return { numberingSystem, hourCycle, calendar };
}

function withDirection(locale: string, direction: 'ltr' | 'rtl'): string {
  try {
    const script = direction === 'rtl' ? 'Arab' : 'Latn';
    const kept = formatSettings(locale);
    const rescripted = formatSettings(new Intl.Locale(locale, { script }).toString());
    // Only the settings the new script would change go into the tag: a numbering system there
    // also stops React Aria's number parser from reading other digits (a date segment typed in
    // Latin digits on an Arabic page), as an app's own `-u-nu-` does.
    const options: Intl.LocaleOptions = { script };
    if (kept.numberingSystem !== rescripted.numberingSystem) {
      options.numberingSystem = kept.numberingSystem;
    }
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
 * formats, so the tag keeps the original's digits, hour cycle and calendar wherever it would
 * (`ar-EG` → `ar-Latn-EG-u-nu-arab`, still Arabic-Indic digits; `zh-Hant-TW` →
 * `zh-Latn-TW-u-hc-h12`, still a 12-hour clock), and only those: a numbering system in the tag
 * also stops numbers typed in other digits from being read. No tag with another script keeps the
 * rest of a locale's own data, which then comes from its language's: words written in its script
 * (Serbian's Latin month names come out Cyrillic) and a region's own patterns and separators
 * (`en-GB`'s day-first dates, `es-MX`'s decimal point). So the tag is for React Aria only:
 * `DomDirectionLocale` keeps the original for the components' own dates, times and numbers and
 * for `useLocale`, and only React Aria's own words and formats there (a calendar day's accessible
 * name) follow the tag. A locale that can't be read gives `ar` or `en-US`.
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
