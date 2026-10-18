# Plan: searchable Select

Status: **built, 2026-10-09** (approved the same day: `searchable` on `Select`; the search takes focus in the menu, and on a tap in the sheet; a 48px search; `PhoneField`'s country field becomes a `Select searchable` with `renderValue`)

## Goal

Long lists such as a country, a currency, a time zone, a business category or a language are slow to scroll. `Autocomplete` already finds an option by typing, but it always opens a menu under the field. On a phone, with the keyboard up, that menu has little room. A `Select` with a search field at the top of its menu or bottom sheet keeps the whole list in view and still filters as you type. Apps call this pattern a "select with search"; shadcn calls it Combobox.

Windmorph Pro's `PhoneField` already has one, but it's private: its country picker is a button that opens a menu or sheet with a search field and the list. This plan makes that pattern a `Select` option, and `PhoneField`'s country field becomes a `Select searchable` itself, so there is one picker.

```tsx
<Select label="Country" searchable presentation="auto" items={countries}>
  {(country) => <SelectItem key={country.code}>{country.name}</SelectItem>}
</Select>
```

## M3 reference

M3 doesn't define a search field inside a menu, so this is an addition to `Select`, documented under "Differences from Compose" like `presentation`. It's built only from parts the library already has:

- the field: `Select`'s, unchanged (the Text field look);
- the search: the M3 search bar's field (`searchBarStyles`: full corners, `surface-container-high`, the 24px icon in a 48px box, `body-large`, the inset focus ring for keyboard focus only), but **48px** tall instead of the search bar's 56px. In a menu of 44px rows, 56px dominates the list; 48px is M3's minimum touch target, so the whole field stays an easy tap (2026-10-09);
- the list: `OptionList`, the Menu's list, shared with `Select`, `Autocomplete` and `PhoneField`;
- the container: the Menu's popover, or the library's bottom sheet.

## When to use which

| Use | When |
|---|---|
| `Select` | A short list (about 3–15) |
| `Select searchable` | A long list (dozens to a few hundred), chosen from on phones as well as larger windows; with `presentation="auto"` |
| `Autocomplete` | Typing *is* the input: free text (`allowsCustomValue`), server results while typing, tags as input chips, or a field that should look editable |

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | API | `searchable?: boolean` on `Select`. `filter?: (textValue, search) => boolean` as `Autocomplete`'s (default `matchesSearch`: anywhere in the text, ignoring case and accents). `searchValue` / `defaultSearchValue` / `onSearchChange` for the typed text. With `onSearchChange`, the app filters `items` itself (e.g. on a server) and `loading` shows the loading row; without it, the built-in filter runs. `labels.search` (the field's placeholder and name, "Search") and `labels.noResults` ("No results"). `renderValue` (for any `Select`, searchable or not) sets what the field shows for the chosen option(s), e.g. a dialling code or a flag and a code, instead of their text; the field's accessible name still includes the chosen options' text |
| 2 | Structure and accessibility | A searchable `Select` follows the WAI-ARIA pattern `PhoneField` uses. The field is a button with `aria-haspopup="dialog"`, opening a dialog named by the field's label. In the dialog, the search is an **editable combobox with list autocomplete** (React Aria `useComboBox`). Focus stays in the search while the arrow keys move through the options (`aria-activedescendant`). A non-searchable `Select` keeps the select-only combobox it has now. Forms still submit through the hidden native select |
| 3 | Keyboard | Opening the menu focuses the search; opening the sheet shows the list first, and a tap on the search focuses it (2026-10-09). Typing filters; ↑ / ↓ move, Home / End jump; Enter chooses; Escape clears a non-empty search, then closes. Focus returns to the field after Escape or a choice; a press outside leaves it (as `Select` now does). Typeahead on the *closed* field still jumps to a match |
| 4 | Single and multiple | Single: Enter or a press chooses and closes. Multiple: each choice toggles, the dialog stays open, and the search text stays so several matches can be chosen; `maxSelections` works as now |
| 5 | Filtering | Options that don't match are hidden. A section with no matches is hidden with its heading, and the other sections keep theirs. Nothing matching shows the designed "No results" row (`role="status"`, announced). The search clears when the dialog closes |
| 6 | Layout | Menu: the search row sits at the top, 4px inside the panel, and doesn't scroll; the list scrolls under it. The panel is at least as wide as the field, and at least 280px so the search fits. Sheet: the same, 8px from the screen's edges, with the list scrolling. Long lists keep plain DOM up to a few hundred options (the 245 countries are fine), as now |
| 7 | `PhoneField` | Its country field becomes a `Select searchable` (2026-10-09): no visible label, `aria-label` from `labels.country`, `renderValue` showing the dialling code (and `renderFlag`'s flag), the same `variant`, its priority countries as a section, and search by name, ISO code and dialling code through `filter`. Its private button, popover, sheet and `CountryList` are removed, so it gets `Select`'s keyboard, focus (one press outside leaves it), screen-reader and theming behaviour. The country field grows about 20px wider, taking the Text field's 48px trailing-icon box. The search and the list live in an internal `select/search-list.tsx` |
| 8 | Motion, RTL, forced colours, server rendering | As `Select` now: the Menu's springs, the sheet's motion, mirrored layout, system colours, and a server-rendered field. The dialog and search render only when opened |

## Files

```
packages/react/src/components/select/search-list.tsx  the shared search + list combobox
packages/react/src/components/select/Select.tsx       searchable, filter, searchValue, renderValue, labels
Windmorph Pro's PhoneField                            its country field is a Select searchable
apps/docs/stories/, apps/docs/e2e/                    a searchable story, visual regression, behaviour
apps/next-playground/                                 the server-rendering check gains a searchable field
apps/site/                                            an example ("Choose a country"), a `searchable`
                                                      playground switch, keywords ("searchable select",
                                                      "select with search", "filter"), Differences from Compose
.changeset/                                           minor: Select gains searchable
docs/architecture.md                                  the Select section
```

## Tests and checks

- **Unit and interaction:** opening focuses the search; filtering with accents, a custom `filter`, and `onSearchChange` with server `items` and `loading`; hidden empty sections; "No results"; arrows, Home / End, Enter, and Escape clearing then closing; single and multiple (stays open, keeps the search, `maxSelections`); focus return after Escape and a choice, and none after a press outside; typeahead on the closed field; form submit; the trigger's `aria-haspopup="dialog"`, the dialog's name, and the combobox's `aria-activedescendant`.
- **`renderValue`:** the field shows the rendered value, its accessible name keeps the options' text, and the hidden select still submits the key.
- **`PhoneField`** keeps passing all its tests (with their country-button queries moved to the `Select` field's name) after its country field becomes a `Select searchable`; its visual baselines are re-rendered and reviewed.
- **Axe** in light and dark.
- **Visual regression:** searchable menu and sheet across the six themes × light/dark × contrast levels, filtered, no results, multiple, right-to-left and forced colours; layout safety; Next.js server rendering.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` and the Playwright checks pass.

## Answered

1. **Phones:** the search takes focus in the menu; in the sheet the list shows first and the search takes focus on a tap, so the keyboard doesn't cover the list at once. `PhoneField` changes to match (2026-10-09).
2. **Where:** in `Select` (main entry), documented as a difference from Compose (2026-10-09).
