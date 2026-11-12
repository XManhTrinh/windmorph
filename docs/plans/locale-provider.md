# Plan: one place for the locale

Status: **plan, waiting for approval** (2026-11-12). Nothing is built.

## The problem

The components take their locale from React Aria: date and time formats, the 12- or 24-hour clock, digits, the first day of the week and the keyboard's direction. Without a provider React Aria uses the browser's language (`en-US` on the server). This package exports no such provider, so an app whose pages have a language of their own has to import `I18nProvider` from `react-aria` itself, and until it does the fields follow the browser, not the page: an English page in an `en-GB` browser gets 24-hour time fields and `DD/MM/YYYY` beside 12-hour page text.

## What exists elsewhere

- React Aria's `I18nProvider` takes a `locale` (a BCP 47 tag) and sets the direction with it.
- Other libraries name the same thing `LocaleProvider`, or make it an option of their one root provider.

## Proposal

| # | Decision | Value |
|---|---|---|
| 1 | What | `LocaleProvider`, exported from the main entry: React Aria's provider under the library's name, taking `locale`. `useLocale` is exported with it, for an app's own formatting |
| 2 | Beside the words | `LabelsProvider` sets the words a component says; `LocaleProvider` sets how it writes dates, times and numbers. An app in another language uses both |
| 3 | Nesting | A provider inside another sets the locale for its part of the page, as React Aria's does |
| 4 | Server rendering | The app passes the same `locale` on the server and in the browser, so the first render matches. It is a client component; a string crosses from a server component, so it can sit in a layout |
| 5 | Without it | Unchanged: the browser's language, `en-US` on the server |
| 6 | Docs | Getting started and the Next.js guide show it beside `ThemeProvider`; the date and time pages and the API conventions' "Words" section say that formats follow it; an API table for it |

## API

```tsx
import { LocaleProvider, ThemeProvider } from '@windmorph/react';

<ThemeProvider>
  <LocaleProvider locale="en-US">{children}</LocaleProvider>
</ThemeProvider>
```

## Checks

- Unit: a `TimeField` and a `DateField` below a provider write the provider's formats whatever the browser's language; a nested provider wins for its part; the direction follows a right-to-left locale.
- The playground renders a provider from a server layout with no hydration difference.
- Docs as in decision 6, and a changeset (`Added:`).

## Open questions

1. **The form:** a `LocaleProvider` component (recommended: it can wrap a part of a page, and keeps `ThemeProvider` about the theme), a `locale` prop on `ThemeProvider` (one provider fewer, but the theme provider would then own the language and direction too), or both?
2. **Without a provider:** keep the browser's language (recommended for now: no behaviour changes), or follow the page's `<html lang>`? Following the page would fix the mismatch with no code in the app, but the server can't read it, so a server-rendered field would change format after hydration unless the app also passes the locale.
