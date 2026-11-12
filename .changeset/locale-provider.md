---
'@windmorph/react': minor
---

Added: `LocaleProvider`, which sets the locale of every component below it once: how dates, times and numbers are written (the order of a date, the 12- or 24-hour clock, digits, the first day of the week) and the direction the arrow keys follow. Without it the components still use the browser's language (`en-US` on the server), so an English page in a British browser got 24-hour time fields and `DD/MM/YYYY`; an app whose pages have a language of their own had to import React Aria's `I18nProvider` itself. Pass the page's language, the same on the server and in the browser: `<LocaleProvider locale="en-US">`. A provider inside another sets it for its part of the page. `useLocale` returns the locale and its direction, for an app's own formatting.
