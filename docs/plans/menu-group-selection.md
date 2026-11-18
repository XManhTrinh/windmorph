# Menu: a group of choices beside plain actions

Status: **approved 2026-11-18** (selection on `MenuGroup`, for 0.2.11).

## The gap

Selection is set on the whole `Menu` (`selectionMode`, `selectedKeys`), and `MenuGroup` takes only `title`, `aria-label` and its items. A menu can't hold a group of choices next to plain actions: an account switcher whose current account is checked, followed by "Add account" and "Settings". Making the whole menu single-select turns the two actions into choices too. The library's own menus opt items out with an internal `checkable={false}`, which apps can't reach.

M3's menus put a selectable group beside actions (a group of radio or checkbox items set off by dividers, with the rest of the menu's items as actions). React Aria Components does the same: each `MenuSection` takes its own `selectionMode` and `selectedKeys`, independent of the menu's.

## API

`MenuGroup` takes the selection props `Menu` takes, for its own items:

| Prop | Type | |
|---|---|---|
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | The group's items are radio (`single`) or checkbox (`multiple`) items. |
| `selectedKeys` / `defaultSelectedKeys` | `Iterable<Key> \| 'all'` | Controlled and uncontrolled, as on `Menu`. |
| `onSelectionChange` | `(keys: Selection) => void` | Called with the group's keys only. |
| `deselectable` | `boolean`, default `true` | `false` keeps one of the group's items selected (the library's name for React Aria's `disallowEmptySelection`). |

- A group with `selectionMode` has its own selection: its items' roles, checks and `aria-checked` follow it, and choosing one never changes another group's or the menu's.
- Items outside such a group follow the menu's own `selectionMode` as before; in a menu with none, they're plain actions (`menuitem`) that close the menu.
- Closing follows React Aria's rules for the group's mode: a choice in a `single` group closes the menu (Space keeps it open), a toggle in a `multiple` group keeps it open, Enter included (as a multi-select menu does, M3), each item's `closeOnSelect` still wins.
- `onAction` on the menu still fires for every item, a group's choices included.
- Focus, typeahead and the arrow keys stay the menu's: a group changes what's selected, never where focus goes.

## Build

React Aria Components gives each selectable section a selection manager whose selection is the section's own and whose focus is the menu's. `react-stately` doesn't export its `SelectionManager` class, so `MenuGroup` builds the same thing from public pieces: the group's selection state from `useMultipleSelectionState` (public), the menu manager's own constructor (the instance's `constructor`, the documented `(collection, state, options)` signature), and a state object whose focus members hand on to the menu's manager. Items read their group's manager from context (`useMenuItem`'s `selectionManager` option).

## Checks

- Unit: a single group's items are `menuitemradio` with `aria-checked`, the rest `menuitem`; choosing in the group calls its `onSelectionChange` with its keys only and closes the menu, a plain action closes it without selecting; controlled and uncontrolled; `deselectable={false}`; a `multiple` group stays open on a toggle; two groups keep separate selections; the menu's own `selectionMode` still works; keyboard (arrows across groups, Space, Enter); axe.
- Story: a menu with a single-choice group and actions, in the Menu stories; screenshots in every theme.
- Docs site: an example on the Menu page and the new props in its API table.
