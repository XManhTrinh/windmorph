import { render, screen } from '@testing-library/react';
import { I18nProvider, useLocale, useNumberFormatter } from 'react-aria';
import { describe, expect, it } from 'vitest';
import { DomDirectionLocale } from './DomDirectionLocale';
import { localeWithDirection } from './locale-with-direction';

const moment = new Date(2026, 0, 1, 15, 5);

/**
 * How a locale writes a number and a time, and its digits, hour cycle and calendar. Not a date's
 * pattern: a region's own (`en-GB`'s day first) is out of reach of a tag with another script.
 */
function formats(locale: string) {
  const number = new Intl.NumberFormat(locale);
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' });
  return {
    number: number.format(1234.5),
    time: time.format(moment),
    numberingSystem: number.resolvedOptions().numberingSystem,
    hourCycle: time.resolvedOptions().hourCycle,
    calendar: time.resolvedOptions().calendar,
  };
}

function Direction() {
  return <>{useLocale().direction}</>;
}

/** The direction React Aria reads from a locale (its `isRTL`), as the components get it. */
function directionOf(locale: string) {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <Direction />
    </I18nProvider>,
  );
  const direction = container.textContent;
  unmount();
  return direction;
}

describe('localeWithDirection', () => {
  it.each(['ar-EG', 'fa-IR', 'zh-Hant-TW', 'en-US', 'en-GB'])(
    'keeps the digits, hour cycle and calendar of %s in either direction',
    (locale) => {
      for (const direction of ['ltr', 'rtl'] as const) {
        const directed = localeWithDirection(locale, direction);
        expect(directionOf(directed)).toBe(direction);
        expect(formats(directed)).toEqual(formats(locale));
      }
    },
  );

  it('adds only what the new script would change', () => {
    // A numbering system written into the tag stops React Aria's number parser from reading
    // other digits (a date segment typed in Latin digits on an Arabic page), so a locale whose
    // settings the script doesn't change gets none.
    expect(localeWithDirection('en-US', 'rtl')).toBe('en-Arab-US');
    expect(localeWithDirection('ar', 'ltr')).toBe('ar-Latn');
    // The locale's own keywords stay.
    expect(localeWithDirection('en-US-u-hc-h23', 'rtl')).toBe('en-Arab-US-u-hc-h23');
  });

  it('falls back to a locale of the direction when the locale can’t be read', () => {
    expect(localeWithDirection('not a locale', 'rtl')).toBe('ar');
    expect(localeWithDirection('not a locale', 'ltr')).toBe('en-US');
  });
});

function Probe() {
  const { direction } = useLocale();
  const number = useNumberFormatter().format(1234.5);
  return (
    <span data-testid="probe" data-direction={direction}>
      {number}
    </span>
  );
}

describe('DomDirectionLocale', () => {
  it.each([
    ['ar-EG', 'ltr', '١٬٢٣٤٫٥'],
    ['en-US', 'rtl', '1,234.5'],
  ] as const)(
    'gives a %s page’s %s region its direction and keeps its digits',
    (locale, direction, number) => {
      render(
        <I18nProvider locale={locale}>
          <DomDirectionLocale>
            {(ref) => (
              <div ref={ref} dir={direction} style={{ direction }}>
                <Probe />
              </div>
            )}
          </DomDirectionLocale>
        </I18nProvider>,
      );
      expect(screen.getByTestId('probe')).toHaveAttribute('data-direction', direction);
      expect(screen.getByTestId('probe')).toHaveTextContent(number);
    },
  );
});
