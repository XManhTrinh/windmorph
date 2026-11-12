import { act, render, screen } from '@testing-library/react';
import { CalendarDate, Time } from '@internationalized/date';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateField, LocaleProvider, TimeField, useLocale } from '../../index';

/** Says the locale and direction a component here would use. */
function Where() {
  const { locale, direction } = useLocale();
  return <p>{`${locale} ${direction}`}</p>;
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
});
