# One place for the words components announce

Status: **built in the core** (2026-11-11, approved the same day with the recommended answers, except that the other package follows in the same release, not the next). See "As built".

## The problem

The words a component shows or announces by itself ("Error", "Clear", "Character count: 0 of 160", "Close") are English by default and can only be changed per instance, through its `labels` prop. An app in another language has to pass `labels` to every instance, and any it misses speaks English. On a page in another language with 51 text fields, every counter announces "Character count: 0 of 160" and every error icon is named "Error".

About 24 core components and 27 Windmorph Pro components take `labels` today (23 and 26 `*Labels` types). Each merges its English defaults with the prop: `{ ...DEFAULT_LABELS, ...labels }`.

## What other libraries do

- A provider with the app's words per component, an instance's own prop winning: the most common shape (a config or locale provider; a theme's locale object).
- Words shipped per locale and picked from the page's language: fewer steps for the app, but the library has to translate and keep every language.
- Per-instance props only: where this library is now.

The first fits here: the app owns its words (tone, product terms), and the library ships no translations to keep up.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | What | `LabelsProvider`, a component that sets the default words for every component below it |
| 2 | Where | `@windmorph/react` (the main entry, beside `ThemeProvider`). Windmorph Pro's components read the same provider |
| 3 | Shape | `labels` is keyed by component: `{ TextField: { error: '…', characterCount: (count, max) => '…' }, DialogHeader: { close: '…' } }`. Each value is that component's `Partial<…Labels>`, the type its own `labels` prop takes, so the editor completes the keys |
| 4 | Order | English default, then the nearest provider, then outer providers' words it doesn't replace, then the instance's `labels` prop, which always wins |
| 5 | Nesting | Providers merge per component and per word, so a section can change one word and keep the rest |
| 6 | Types | A `WindmorphLabels` interface maps component names to their labels types. Pro adds its components to it by declaration merging, so one provider and one object cover both packages, fully typed |
| 7 | Inside | One internal hook, `useLabels('TextField', DEFAULT_LABELS, labels)`, replaces each component's spread. No behaviour changes without a provider |
| 8 | Shared words | Components that share a labels type (the pickers' dialog words) read one key, so the app writes them once |
| 9 | No translations shipped | The provider takes the app's words. Locale packs could come later as plain objects to pass in |
| 10 | Server rendering | The provider is a client component. Some words are functions (`characterCount`), which can't cross from a server component as props, so the app renders the provider in a client file of its own; the docs show that for Next.js |

## API

```tsx
'use client';
import { LabelsProvider, type WindmorphLabels } from '@windmorph/react';

const words: WindmorphLabels = {
  TextField: {
    error: 'Fehler',
    characterCount: (count, max) => `Zeichen: ${count} von ${max}`,
  },
  DialogHeader: { close: 'Schließen' },
};

export function AppLabels({ children }: { children: React.ReactNode }) {
  return <LabelsProvider labels={words}>{children}</LabelsProvider>;
}
```

A component's own `labels` still wins: `<TextField labels={{ error: 'Ungültiges Format' }} />`.

## Checks

- Unit: the order (default, provider, nested provider, prop); a provider that names one word keeps the others; no provider changes nothing.
- A guard over every component: a test reads each exported component's props and fails if one takes `labels` but its words don't change under a provider (so a new component can't forget the hook), in the core and in Pro.
- Types: every `*Labels` type is in `WindmorphLabels`; Pro's merge compiles; a wrong key or word is a type error.
- Server rendering: the playground renders components under a provider from a client file, with no hydration difference.
- Docs: a guide section ("Translating the built-in words") with the full list of words per component, generated from the types; each component's page links to it. A changeset (`Added:`).

## Size of the change

Every component with `labels` (about 24 in the core, 27 in Pro) changes one line. The provider and hook are small. The work is mostly the guard test, the types map and the docs list.

## Open questions

1. **Name:** `LabelsProvider` (matches the `labels` prop), or `LocaleProvider` / `WordsProvider`? Recommended: `LabelsProvider`.
2. **Locale packs:** ship none now (recommended), or start with one or two languages?
3. **Order of work:** core first and release, then Pro in its next release (recommended, since Pro builds on a released core), or both at once?

## As built (2026-11-11)

- **Answers:** the name is `LabelsProvider`; no locale packs; the core first, and the other package in the same release.
- **Keys:** a key is the labels type's name without `Labels`, so the dialog's is `DialogHeader`, and components that share a type share a key (`Button`, `Chip`, `DatePicker`, `TimePicker`, `Snackbar`). `DateInputLabels` has no key: its words are part of `DatePickerLabels` and `DateFieldLabels`.
- **Shared words:** a component built from another passes that one's key before its own: `DateField` reads `DatePicker`'s words (its compact window shows that picker, so both layouts say the same), and `TimeField` reads `TimePicker`'s and `PickerDialog`'s.
- **The hook is public:** `useLabels(key, defaults, labels)` is exported from `/primitives`, so a package built on the core, or an app's own component, reads the provider after adding its key to `WindmorphLabels` by declaration merging.
- **A word left `undefined`** keeps the one below it, in a provider and in a component's own `labels` (it used to remove the default in the components that spread their labels).
- **The guard** renders every component that takes `labels` below a provider whose words are generated from the types, so a new word or component needs no new test data, only a case that shows the component.
- **Docs:** the API conventions guide's "Words" section, with the provider's generated table; every `labels` prop's description links to it; `useLabels` is on the Primitives page.
