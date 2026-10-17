# Plan: Select and Autocomplete (M3 exposed dropdown menus)

Status: **built, 2026-10-08** (approved the same day: full API with multiple selection in both; `Select` opens a menu by default, with `presentation` for a sheet)

## Goal

Two M3 form components for choosing from a list, used by many products:

- **`Select`**: a field that opens a menu of options and shows the chosen one (a sort order, a currency, a country of residence).
- **`Autocomplete`**: a field you type into, with a menu of matching options below it (a city, a category, a country, a business).

Today the library has neither, so apps have nothing to pick from a list with, and `PhoneField` carries a private picker. Decided 2026-10-08: build them as general components, following best practice.

## M3 reference

M3 calls this the **exposed dropdown menu**: a text field with a menu attached (m3.material.io, Menus). Jetpack Compose's Material 3 ships it as `ExposedDropdownMenuBox` + `ExposedDropdownMenu`, in two forms, which this library's rules make the source of exact values:

| Compose | This library |
|---|---|
| `MenuAnchorType.PrimaryNotEditable`: a read-only field opens the menu | `Select` |
| `MenuAnchorType.PrimaryEditable`: typing in the field filters the menu | `Autocomplete` |

Both are **M3 components** (`src/components`, the main `@windmorph/react` entry), as the architecture's layering already plans ("Select / Combobox reuse `Field` parts + Menu list"). The field takes the text field's tokens and the list takes the menu's, so neither can drift from `TextField` or `Menu`.

Accessibility follows WAI-ARIA's two separate patterns: the **select-only combobox** (`Select`) and the **editable combobox with list autocomplete** (`Autocomplete`), built on React Aria's `useSelect` and `useComboBox`.

## When to use which

| Use | When |
|---|---|
| `Select` | One choice from a short, known list (about 3–15), where typing wouldn't help |
| `Autocomplete` | A long list (countries, cities, categories) or options loaded from a server, where typing finds the option faster |
| `RadioGroup` | Up to about five options that should all stay visible |
| `Menu` | Actions, not a value |

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Where | `packages/react/src/components/select/` and `.../autocomplete/`, exported from `@windmorph/react`; the shared list in `src/components/select/` (or a small internal module both import) |
| 2 | Field | The `TextField` look, in `filled` (default, as `TextField`) and `outlined`: floating label, supporting text, error, `required`, `disabled`, `readOnly`, a trailing arrow (`arrow_drop_down`, turning to `arrow_drop_up` while open, as Compose's `TrailingIcon`) and an optional leading icon. A `Select` field is a button showing the chosen option's text; an `Autocomplete` field is a text input |
| 3 | List | The library's **Menu** styles: `surface-container-low`, elevation 2, the large corner, 44px items, label-large text, `tertiary-container` for the chosen option, state layers and the inset focus ring. As wide as the field (Compose's `exposedDropdownSize`), up to the menu's maximum. Items can have a leading icon, a description line and a trailing text (e.g. a dialling code), and can be disabled. Sections with headings, and dividers |
| 4 | Placement and windows | M3's baseline everywhere: the list opens as a **menu under the field** (above it when there's no room, via React Aria `usePopover`), on every window size, as Compose's `ExposedDropdownMenu` does. `Select` adds **`presentation`**: `"menu"` (default), `"sheet"` (always the library's bottom sheet, which M3 offers as an alternative to menus on phones) or `"auto"` (a sheet on compact windows, a menu on medium and larger), for apps with long lists (2026-10-08). `Autocomplete` always uses the menu, since the text being typed must stay visible |
| 5 | Selection | Single or multiple, in **both** components (2026-10-08: the full API). `selectionMode="single"` (default) or `"multiple"`, controlled or uncontrolled (`value` / `defaultValue` / `onChange`; `open` / `defaultOpen` / `onOpenChange` on `Select`, `onOpenChange` on `Autocomplete`). Chosen options show a check in the menu, as M3 menus show selection. Multiple `Select` lists the chosen options in the field (comma-separated, truncated, with a count when they don't fit); multiple `Autocomplete` shows them as **M3 input chips** inside the field, each removable with its close button or Backspace, and the menu stays open between picks. `maxSelections` caps the count |
| 6 | Filtering (`Autocomplete`) | Locale-aware and accent-insensitive by default ("zurich" finds "Zürich"), matching anywhere in the text; `filter` replaces it, and `items` plus `onInputChange` let an app load options from a server (with `loading` showing an M3 loading indicator in the list). `allowsCustomValue` keeps free text. "No results" shows a designed empty row |
| 7 | Keyboard | `Select`: Space, Enter or the arrows open; arrows move; typeahead jumps; Enter chooses; Escape closes. `Autocomplete`: typing opens and filters; arrows move through the list while focus stays in the input; Enter chooses; Escape closes, then clears. Focus returns to the field |
| 8 | Forms | `name` submits the chosen key (`Select`) or the value (`Autocomplete`); a hidden native `<select>` for `Select` so form autofill and validation work; `validate` and native constraints as in `TextField` |
| 9 | Collections | The React Stately collection API, like `Menu`: `<SelectItem>` / `<SelectSection>` children identified by React `key` (as `MenuItem`), or `items` with a render function; flat named exports (`SelectItem`, `SelectSection`, `AutocompleteItem`, `AutocompleteSection`), per the library's composition rule. Items must be created in client components |
| 10 | Long lists | Renders plain DOM up to a few hundred options (the 245 countries are fine); virtualization is left for later if an app needs thousands |
| 11 | Motion | The menu's open and close springs (scale and fade from the field's edge); the arrow rotates on the fast spatial spring; all off under reduced motion |
| 12 | Right-to-left, forced colours, server rendering | As `TextField` and `Menu`: mirrored layout, system colours for outlines and the chosen option, and server-rendered fields with no layout shift |
| 13 | `PhoneField` | Stays in Windmorph Pro (its button-and-popup picker isn't M3), but its country list becomes the shared list, so it looks and behaves exactly like `Autocomplete`'s |
| 14 | API conventions | `variant`, `className`, `classNames` (`root`, `field`, `label`, `value`/`input`, `trailingIcon`, `list`, `item`, `supportingText`, `errorText`), `data-*` states (`data-open`, `data-invalid`, `data-disabled`), TSDoc |

## API

```tsx
import { Autocomplete, AutocompleteItem, Select, SelectItem } from '@windmorph/react';

<Select label="Sort by" defaultValue="newest" onChange={setSort}>
  <SelectItem key="newest">Newest first</SelectItem>
  <SelectItem key="price-low">Price, low to high</SelectItem>
  <SelectItem key="price-high">Price, high to low</SelectItem>
</Select>

<Autocomplete label="City" defaultItems={cities} onChange={setCity} supportingText="Where you live">
  {(city) => (
    <AutocompleteItem key={city.id} description={city.region}>
      {city.name}
    </AutocompleteItem>
  )}
</Autocomplete>
```

## Files

```
packages/react/src/components/select/         Select, SelectItem, SelectSection, the shared list
packages/react/src/components/autocomplete/   Autocomplete, AutocompleteItem
Windmorph Pro's PhoneField                    its picker uses the shared list
apps/docs/stories/, apps/docs/e2e/            stories, visual regression, behaviour, layout safety
apps/next-playground/                         server rendering and hydration checks
apps/site/                                    two pages in the Inputs group, playgrounds, examples,
                                              search keywords (dropdown, combobox, picker, typeahead),
                                              the component count
.changeset/                                   minor: adds Select and Autocomplete
docs/architecture.md                          both components, with their Compose sources
```

## Tests and checks

- **Unit and interaction:** opening, choosing and closing with mouse, touch and keyboard (each key in decision 7); typeahead in `Select`; filtering with accents, custom filters and async items in `Autocomplete`; sections and disabled items; multiple selection in both (the field text, input chips and their removal, `maxSelections`); each `presentation` of `Select`; controlled and uncontrolled; form submit, reset and validation; accessible names and states (`aria-expanded`, `aria-activedescendant`, `aria-invalid`).
- **Axe** in every story, light and dark.
- **Visual regression** across the six themes × light/dark × contrast levels, both variants, closed and open, with a selection, invalid, disabled, the empty state, the bottom sheet at phone width, right-to-left and forced colours.
- **Layout safety** with the architecture's override matrix, and **Next.js** server rendering.
- **`PhoneField`** keeps passing all its tests after moving to the shared list.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` and the Playwright checks pass.

## Answered

1. **Multiple selection:** in both components now, with input chips in `Autocomplete` (2026-10-08).
2. **Phones:** a menu under the field by default, as M3 and Compose do; `Select`'s `presentation` offers `"sheet"` and `"auto"` (2026-10-08).
