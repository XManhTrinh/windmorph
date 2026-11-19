import { render, screen } from '@testing-library/react';
import { I18nProvider, useLocale } from 'react-aria';
import { useNumberFieldState } from 'react-stately';
import { describe, expect, it } from 'vitest';
import { DomDirectionLocale } from './DomDirectionLocale';
import { localeWithDirection } from './locale-with-direction';
import { usePageNumberFormatter } from './use-page-formatters';

/**
 * A locale's hour cycle and calendar. Not its digits, which the tag leaves to the new script so
 * that React Aria's parser reads Latin ones there (the components write the page's), nor a date's
 * pattern: a region's own (`en-GB`'s day first) is out of reach of a tag with another script.
 */
function formats(locale: string) {
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' });
  return {
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
    'keeps the hour cycle and calendar of %s in either direction',
    (locale) => {
      for (const direction of ['ltr', 'rtl'] as const) {
        const directed = localeWithDirection(locale, direction);
        expect(directionOf(directed)).toBe(direction);
        expect(formats(directed)).toEqual(formats(locale));
      }
    },
  );

  it('adds only what the new script would change, and never a numbering system', () => {
    // A numbering system written into the tag stops React Aria's number parser from reading
    // other digits (an app's number or date segment typed in Latin digits in a left-to-right
    // region of an Arabic page), so the tag takes the new script's digits.
    expect(localeWithDirection('en-US', 'rtl')).toBe('en-Arab-US');
    expect(localeWithDirection('ar', 'ltr')).toBe('ar-Latn');
    expect(localeWithDirection('ar-EG', 'ltr')).toBe('ar-Latn-EG');
    // The locale's own keywords stay.
    expect(localeWithDirection('en-US-u-hc-h23', 'rtl')).toBe('en-Arab-US-u-hc-h23');
  });

  it('falls back to a locale of the direction when the locale can’t be read', () => {
    expect(localeWithDirection('not a locale', 'rtl')).toBe('ar');
    expect(localeWithDirection('not a locale', 'ltr')).toBe('en-US');
  });
});

/** The direction React Aria has, the components' number and whether React Aria reads `12`. */
function Probe() {
  const { direction, locale } = useLocale();
  const number = usePageNumberFormatter().format(1234.5);
  const parser = useNumberFieldState({ locale });
  return (
    <span data-testid="probe" data-direction={direction} data-reads-latin={parser.validate('12')}>
      {number}
    </span>
  );
}

describe('DomDirectionLocale', () => {
  it.each([
    ['ar-EG', 'ltr', '١٬٢٣٤٫٥'],
    ['en-US', 'rtl', '1,234.5'],
  ] as const)(
    'gives a %s page’s %s region its direction, keeps the components’ digits and reads Latin ones',
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
      // An app's own React Aria number or date-segment input there takes Latin digits.
      expect(screen.getByTestId('probe')).toHaveAttribute('data-reads-latin', 'true');
    },
  );
});
