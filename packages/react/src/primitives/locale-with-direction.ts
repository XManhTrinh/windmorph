/**
 * The locale with the given direction, keeping its language and region so dates and
 * numbers still format the same: only the script changes (`en-US` → `en-Arab-US` for RTL,
 * `ar` → `ar-Latn` for LTR), which React Aria's `isRTL` reads.
 */
export function localeWithDirection(locale: string, direction: 'ltr' | 'rtl'): string {
  try {
    return new Intl.Locale(locale, { script: direction === 'rtl' ? 'Arab' : 'Latn' }).toString();
  } catch {
    return direction === 'rtl' ? 'ar' : 'en-US';
  }
}
