# Plan: SearchField, the search bar's pill as its own component

Status: **approved 2026-11-10, built 2026-11-10.** Written from a consumer's brief. The component is in `packages/react/src/components/search/`. The ❓ decisions were settled as recommended on 2026-11-10; **Built** below records where the build differs from the draft.

## Goal

A search box that filters content in place (a settings list, a table, a list pane) and never opens a search view, drawn as M3's search bar pill.

Today nothing fits:

- `SearchBar` always opens its view (docked or full screen) when it's pressed, typed in, or gets Enter or ↓. Its collapsed input is `role="combobox"` with `aria-haspopup="dialog"` and `aria-expanded`. Holding it shut with `expanded={false}` still announces a combobox that opens a dialog that never comes, which fails WCAG 4.1.2 (name, role, value).
- `TextField type="search"` has the right role, but it's M3's text field (floating label, filled or outlined box), not the search pill.
- `MessageField` (Pro) is a pill, but it's a composer: a growing textarea where Enter sends.

Material draws the same line. Compose's M3 `SearchBar` takes a separate `InputField` (`SearchBarDefaults.InputField`), and Flutter keeps `SearchBar` apart from `TextField`. So this is a core component, built from what core already has, not a `TextField` variant: M3 has no pill text field, and a search variant would leave most of `TextField`'s props (label, supporting text, error, counter, prefix, suffix) doing nothing.

## What already exists

The pill is drawn twice in core. **Extract it; don't rebuild it.**

1. **`search/SearchBar.tsx`, the internal `SearchField` part** (around line 508): the pill frame. `data-tokens="md-comp-search-bar"`, the inset focus ring while the input has keyboard focus (`useFocusRing({ within: true, isTextInput: true })`), and `ButtonContext` with `standardIconButtons` for the slots.
2. **`select/search-list.tsx`, the searchable `Select`'s search:** the right behaviour already. React Aria's `useSearchField` (with `useAutocomplete`), drawn with `searchBarStyles({ hasLeading: true })` and the `md-comp-search-bar` tokens. Escape clears the search.

Start from `select/search-list.tsx` for the behaviour, and from `SearchBar.tsx` for the frame.

Reuse as they are:

- **`search/search-styles.ts`:** the 56px pill, the 48px leading slot with a 4px inset, the trailing slot (48px minimum, 8px gap, a 30px avatar), the `body-large` input, and input padding of 4px beside a slot and 16px without one.
- **`search/search-tokens.ts`:** `md-comp-search-bar`:
  - `container-color`: `surface-container-high`;
  - `container-shape`: `full`;
  - `input-text-color`: `on-surface`;
  - `leading-icon-color`: `on-surface`;
  - `trailing-icon-color`: `on-surface-variant`.

## Decisions

✅ follows the library or M3. ❓ were open, and were settled as recommended on 2026-11-10.

| # | Decision | Value |
|---|---|---|
| 1 | ✅ Name and place | `SearchField`, a flat named export from `@windmorph/react`, in `src/components/search/` beside `SearchBar` |
| 2 | ✅ Behaviour | `useSearchField`: `type="search"`, `role="searchbox"`. Escape clears the text (a second Escape does nothing), Enter calls `onSubmit`. Nothing ever opens |
| 3 | ✅ Clear button | A standard `IconButton` in the trailing slot, shown only while there's text, named by `labels.clear` (English default "Clear search"). It clears and keeps focus in the input. Any `trailingIcon` sits beside it |
| 4 | ✅ Tokens | Reads `md-comp-search-bar`, so a theme or scoped override of the search bar changes both |
| 5 | ✅ Size | 56px tall, as M3's search bar |
| 6 | ✅ States | As `SearchBar`'s pill: the inset focus ring for keyboard focus, and no hover or pressed state layer (the pill never had one; see **Built**). M3's disabled colours (content `on-surface` at 38%, container at 12%) |
| 7 | ✅ Right to left | Logical slots and padding (start and end), as today |
| 8 | ❓ → ✅ Default width | `w-full`, so it fills its container in a page or a list pane. `SearchBar` keeps its own 360–720px root |
| 9 | ❓ → ✅ Density | None, matching `SearchBar` (M3 sizes the search bar at 56dp) |
| 10 | ❓ → ✅ Clear button in `Select`'s search list | No change (Escape only, as before), so `Select`'s behaviour stays as audited |
| 11 | ❓ → ✅ A drift test with `MessageField` | Yes, in Pro: `MessageField`'s `lg` `filled` still matches the search pill's container colour, shape and 56px height. A test, not shared code |

## API

- `value` / `defaultValue` / `onChange(value)`, and `onSubmit(value)`.
- `aria-label` or `aria-labelledby`, one of them required (typed like `SearchBar`'s `Naming`), plus `aria-describedby` and `aria-details`.
- `placeholder`.
- `leadingIcon`: usually a search icon, or a back button.
- `trailingIcon`: one or two icon buttons, or an avatar, as in `SearchBar`.
- `disabled`, `autoFocus`.
- `inputProps`, with the same rules as `SearchBarInputProps`.
- `labels`: `clear`.
- `className`, `classNames` (`root`, `field`, `input`, `leading`, `trailing`), `style`, `ref`, `inputRef`, and `data-*` passed to the root.

## Build

1. **Export `SearchField`** as above.
2. **Rewire the two existing uses:**
   - `SearchBar`'s collapsed pill renders `SearchField`'s frame and keeps its combobox role, popup state and open-on-type behaviour. Its public API doesn't change.
   - `Select`'s search list renders `SearchField` and keeps `useAutocomplete`, its labels and its Escape behaviour.
   - **No visual change:** the screenshot and painted-style tests for `SearchBar`, `SearchAppBar` and the searchable `Select` stay identical.
3. **Docs:**
   - a `SearchField` page with examples: filtering a list, with a trailing icon, disabled, and full width in a pane;
   - "when to use which": `SearchField` filters in place, `SearchBar` opens suggestions or results, `TextField type="search"` is for forms;
   - the full props table;
   - add it to the search index, its side navigation group, the components listing and the component count;
   - neutral English samples.
4. **Tests:**
   - the search-box role and accessible name;
   - Escape clears; the clear button appears and disappears with the text, clears and keeps focus;
   - `onSubmit` on Enter, and nothing opening on type, press or ↓;
   - disabled;
   - right to left;
   - light and dark, with the token defaults painted;
   - a scoped theme override of `md-comp-search-bar`;
   - layout under consumer overrides (fixed, absolute, overflow, transforms);
   - the keyboard focus ring;
   - the clear button's 48px touch target.
5. **Release:** a changelog entry, and `SearchField` and its types exported from the package index.

## Out of scope

- `MessageField` stays separate: it's Pro, not M3, and a growing multi-line textarea with send, tools, three sizes and three variants. Core can't depend on Pro, so a shared base would have to carry all of that.
- No change to `TextField`.

## Done when

- `SearchField` is exported, documented and tested as above.
- `SearchBar` and the searchable `Select` are built on it, with unchanged screenshots.
- A screen reader announces a search box, never a combobox, and the clear button is reachable by keyboard and has a 48px touch target.

## Built (2026-11-10)

- **`SearchField`**, `SearchFieldProps`, `SearchFieldClassNames`, `SearchFieldLabels`, `SearchFieldInputProps`, `searchFieldStyles` and `SearchFieldStyleProps` are exported from the main entry.
- **One pill:** the pill is the internal `search/search-field-frame.tsx` (`SearchFieldFrame`: the `md-comp-search-bar` tokens, the inset focus ring, `ButtonContext` with standard icon buttons). `SearchBar` (collapsed and in its views), `SearchField` and the searchable `Select` draw it; the search bar recipe gained a `disabled` variant for `SearchField`. The search bar, search app bar and searchable `Select` screenshots, and the computed styles of every existing story, were unchanged.
- **`Select`'s search renders the shared pill, not the public `SearchField`:** its input is the option list's combobox, wired by `useAutocomplete` (`aria-controls`, `aria-activedescendant`, its key handling), which `SearchField`'s `inputProps` rules leave out on purpose. It keeps its 48px height, its density and its hit area.
- **Decision 6 corrected:** the draft said "hover and pressed state layers as `SearchBar`'s pill", but that pill has none (only the focus ring), and adding them would have changed `SearchBar` and `Select`. `SearchField` matches the pill as it is. If M3's search bar should show hover and pressed layers, that's one change to the frame, for all three.
- **The clear button is in the Tab order** (this plan's "Done when"), where React Aria's own search field leaves it out because Escape clears; it hands focus back to the input. `Autocomplete`'s clear button stays out of the Tab order.
- **API additions:** `clearIcon` (icons are replaceable), `classNames.clear` (every part has a key), `aria-controls` for what the field filters, and `id`, which goes to the input as on the other fields.
- **Docs:** the page (`/components/search-field`, under Inputs & selection) links to the Search page's token table, since each token set has its table on one page.

