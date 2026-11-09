/** The locale's clock: 12 in en-US, 24 in en-GB. */
export function localeHourCycle(locale: string): 12 | 24 {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
}
