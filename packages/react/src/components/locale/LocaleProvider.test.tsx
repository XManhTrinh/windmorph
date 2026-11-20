import { act, render, screen } from '@testing-library/react';
import { CalendarDate, Time } from '@internationalized/date';
import type { ReactNode } from 'react';
import { useLocale as useAriaLocale } from 'react-aria';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateField, LocaleProvider, TimeField, useLocale } from '../../index';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';

/** Says the locale and direction a component here would use. */
function Where() {
  const { locale, direction } = useLocale();
  return <p>{`${locale} ${direction}`}</p>;
}

/** Says the locale `useLocale` gives, its direction and the locale React Aria reads. */
function Seen({ name }: { name: string }) {
  const { locale, direction } = useLocale();
  return <p data-testid={name}>{`${locale} ${direction} ${useAriaLocale().locale}`}</p>;
}

/** A region laid out in `direction`, as a toolbar or list in it reads it. */
function Region({ direction, children }: { direction: 'ltr' | 'rtl'; children: ReactNode }) {
  return (
    <DomDirectionLocale>
      {(ref) => (
        <div ref={ref} dir={direction} style={{ direction }}>
          {children}
        </div>
      )}
    </DomDirectionLocale>
  );
}

const time = (name: string) => screen.getByRole('textbox', { name });

/** The browser reports another language, as when the person changes it in their settings. */
function browserLanguage(language: string) {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
  act(() => {
    window.dispatchEvent(new Event('languagechange'));
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  act(() => {
    window.dispatchEvent(new Event('languagechange'));
  });
});

describe('LocaleProvider', () => {
  it("writes times and dates the locale's way, whatever the browser's language", () => {
    render(
      <>
        <TimeField label="Browser" defaultValue={new Time(15, 30)} />
        <LocaleProvider locale="en-US">
          <TimeField label="Opens at" defaultValue={new Time(15, 30)} />
          <DateField label="Starts on" defaultValue={new CalendarDate(2030, 3, 21)} />
        </LocaleProvider>
      </>,
    );
    browserLanguage('en-GB');
    // The field outside follows the browser: 24 hours on a page written in American English.
    expect(time('Browser')).toHaveValue('15:30');
    expect(time('Opens at')).toHaveValue('3:30 PM');
    expect(screen.getByRole('textbox', { name: 'Starts on' })).toHaveValue('03/21/2030');
  });

  it('follows a new locale', () => {
    const { rerender } = render(
      <LocaleProvider locale="en-US">
        <TimeField label="Opens at" defaultValue={new Time(15, 30)} />
        <DateField label="Starts on" defaultValue={new CalendarDate(2030, 3, 21)} />
      </LocaleProvider>,
    );
    rerender(
      <LocaleProvider locale="de-DE">
        <TimeField label="Opens at" defaultValue={new Time(15, 30)} />
        <DateField label="Starts on" defaultValue={new CalendarDate(2030, 3, 21)} />
      </LocaleProvider>,
    );
    expect(time('Opens at')).toHaveValue('15:30');
    expect(screen.getByRole('textbox', { name: 'Starts on' })).toHaveValue('21.03.2030');
  });

  it('sets the locale for its part of the page inside another', () => {
    render(
      <LocaleProvider locale="en-US">
        <TimeField label="Outer" defaultValue={new Time(15, 30)} />
        <LocaleProvider locale="fr-FR">
          <TimeField label="Inner" defaultValue={new Time(15, 30)} />
        </LocaleProvider>
      </LocaleProvider>,
    );
    expect(time('Outer')).toHaveValue('3:30 PM');
    expect(time('Inner')).toHaveValue('15:30');
  });

  it('gives a right-to-left locale its direction, and the locale to useLocale', () => {
    render(
      <>
        <LocaleProvider locale="en-US">
          <Where />
        </LocaleProvider>
        <LocaleProvider locale="ar-EG">
          <Where />
        </LocaleProvider>
      </>,
    );
    expect(screen.getByText('en-US ltr')).toBeInTheDocument();
    expect(screen.getByText('ar-EG rtl')).toBeInTheDocument();
  });
});

describe('useLocale', () => {
  it("is the browser's language without a provider", () => {
    render(<Where />);
    expect(screen.getByText('en-US ltr')).toBeInTheDocument();
    browserLanguage('de-DE');
    expect(screen.getByText('de-DE ltr')).toBeInTheDocument();
  });

  // React Aria reads direction only from a locale's script, so a region laid out the other way
  // gives it the locale in another script; an app's own formatting there, as the fields', keeps
  // the page's (`en-Arab-GB` writes plain `en`: Sep 4, 2030 for 4 Sept 2030).
  it('is the page’s locale inside a region of the other direction, with the region’s direction', () => {
    render(
      <LocaleProvider locale="en-GB">
        <Region direction="rtl">
          <Seen name="region" />
          <Region direction="ltr">
            <Seen name="back" />
          </Region>
          <LocaleProvider locale="fr-FR">
            <Seen name="app" />
            <Region direction="rtl">
              <Seen name="app region" />
            </Region>
          </LocaleProvider>
        </Region>
      </LocaleProvider>,
    );
    expect(screen.getByTestId('region')).toHaveTextContent('en-GB rtl en-Arab-GB-u-hc-h23');
    // A region inside, back in the page's direction, gives React Aria the page's own locale.
    expect(screen.getByTestId('back')).toHaveTextContent('en-GB ltr en-GB');
    // An app's own provider inside the region sets the locale for its part, as anywhere.
    expect(screen.getByTestId('app')).toHaveTextContent('fr-FR ltr fr-FR');
    expect(screen.getByTestId('app region')).toHaveTextContent('fr-FR rtl fr-Arab-FR');
  });
});
