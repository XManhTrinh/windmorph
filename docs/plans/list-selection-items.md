# Plan: List items that toggle or select (`@windmorph/react`, M3)

Status: approved (2026-10-10); built on `feat/list-selection-items`.

## Goal

Finish `List` to match Compose Material 3's Expressive `ListItem` and `SegmentedListItem` in full. Today Windmorph has three of Compose's interactive kinds: static, clickable (`onAction`, `href`) and the grid list's selection highlight. It's missing the two that settings pages are built from:

- **Toggleable items:** the whole row is a checkbox or a switch (Android's Settings: Wi‑Fi, Bluetooth). Compose's `checked` / `onCheckedChange` overloads.
- **Selectable items:** the whole row is a radio button in a single-choice list (Language, Theme). Compose's `selected` / `onClick` overloads, `Role.RadioButton`.

It also adds the rest of Compose's item API that Windmorph lacks: per-item disabled and vertical alignment (long press is left out on purpose, decision 9).

## Why it was missing

The first `List` (`3d5c5f2`) was built on React Aria's grid list: actions, links and a selected highlight, with controls left to the `trailing` slot. Compose's selectable and toggleable overloads were never planned. When an app's settings pages needed them, the gap wasn't raised. Instead the app hand-styled its rows, and this plan replaces that.

## When to use which

| Need | Use |
| --- | --- |
| An on/off setting that applies at once | Toggle item, `control="switch"` |
| Choosing several items (filters, a "select people" list) | Toggle item, `control="checkbox"` |
| One choice out of a few, applied at once | Radio list (`List` with `value`) |
| A row that opens something, plus a separate switch (Android's "split" row) | Action item (`onAction`) with an interactive `Switch` in `trailing`; this works today (← / → move into the switch) |
| Many options, or inside a form with a submit button | `RadioGroup` / `Checkbox` / `Switch` on their own |
| Highlighting the open item in a list-detail layout | The existing `selectionMode="single"` |

## Decisions

1. **The row is the control.** A toggle item is one element with `role="switch"` or `role="checkbox"` and `aria-checked`. A radio item is `role="radio"` inside a `role="radiogroup"`. The drawn checkbox, switch or radio inside is decorative (`aria-hidden`), the same component's visuals without its own input, so there's one focus stop, one tap target (the whole row) and one name.
2. **Switch gets `role="switch"`.** Compose uses `Role.Checkbox` for every toggleable item, because Android has no switch role on lists. ARIA does, and screen readers then say "on/off" instead of "checked". A deliberate difference for the web.
3. **Name and description.** The headline names the row (`aria-labelledby`); overline and supporting text describe it (`aria-describedby`), as items do today.
4. **Placement follows M3:** the checkbox and radio are leading, the switch trailing. `controlPlacement` can override it. The other side keeps `leading` / `trailing` content (an icon, an avatar).
5. **Visual states come from the list item, not the control.** The item gets the state layer, the hovered, focused and pressed shape morphs, the segmented corners and the disabled colours. The drawn control only shows on, off and disabled; it has no state layer of its own (Compose: a control with no `onClick` takes no interaction). Checked and selected items take the selected colours (`secondary-container`) and the selected shape, as Compose does: its toggleable and selectable overloads pass `selected = checked` to the colours and shapes.
6. **Keyboard.** Switch and checkbox items: Tab to each, Space toggles, as native checkboxes and the WAI-ARIA Switch pattern do. Radio lists: one Tab stop on the selected (or first) item; ↑ / ↓ move and select, wrapping, as native radio groups do.
7. **Mixing kinds in one list.** A static list can mix plain, switch and checkbox items (a `ul`, each switch or checkbox item its own control). Switch and checkbox items can't go in an interactive list (`onAction`, links, `selectionMode`): a grid list row can't also be a switch, so the list throws a clear error. For an item that opens something and has its own switch, put a `Switch` in the item's `trailing` content (Android's split row). A radio list holds only radio items, each with a `value`.
8. **Controlled and uncontrolled,** like every Windmorph input: `checked` / `defaultChecked` and `value` / `defaultValue`. Forms: `name` and `value` render a hidden input, so the items post with a native form.
9. **No long press.** Compose's `onLongClick` is left out: on the web an action must be reachable by every pointer and the keyboard (WCAG 2.5.1, 2.1.1), and a long press has no mouse or keyboard way in. Put such actions in a menu from a trailing icon button.
10. **`verticalAlignment`:** `"center"` or `"top"`. The default follows Compose: top for three-line items, otherwise centre (what Windmorph does today).
11. **No dense variant.** Compose's `ListItem` has none; its sizes come from the tokens, and density is one theme-wide setting that Windmorph leaves out of v1 (architecture §15). When it comes, it applies to every component at once, lists included, not as a `List` prop.

## API

```tsx
// Toggle items (Compose: ListItem(checked, onCheckedChange))
<List variant="segmented" aria-label="Privacy">
  <ListItem
    control="switch"                  // 'switch' | 'checkbox'
    checked={indexing}                // or defaultChecked
    onCheckedChange={setIndexing}
    supportingText="Search engines like Google can list you"
  >
    Show my profile in search engines
  </ListItem>
</List>

// Radio list (Compose: ListItem(selected, onClick), Role.RadioButton)
<List variant="segmented" aria-label="Theme" value={mode} onChange={setMode}>
  <ListItem value="light">Light</ListItem>
  <ListItem value="dark">Dark</ListItem>
  <ListItem value="system">Match my device</ListItem>
</List>
```

New `ListItem` props:

| Prop | Type | Notes |
| --- | --- | --- |
| `control` | `'switch' \| 'checkbox'` | Makes it a toggle item |
| `checked` / `defaultChecked` | `boolean` | |
| `onCheckedChange` | `(checked: boolean) => void` | |
| `controlPlacement` | `'leading' \| 'trailing'` | Default: checkbox leading, switch trailing |
| `value` | `string` | A radio item's value in a radio list; with `name`, a toggle item's form value |
| `name` | `string` | Toggle items in a form |
| `disabled` | `boolean` | Per item (today only `List`'s `disabledKeys`) |
| `verticalAlignment` | `'center' \| 'top'` | |
| `switchIcons` | `boolean` | Passes through to the switch's thumb icons |

New `List` props, for a radio list: `value`, `defaultValue`, `onChange(value: string)` (named `onValueChange` until 2026-10-24, when it took the library's single-value name), `name`, `disabled`, `required`, plus the existing `aria-label` / `aria-labelledby`. `controlPlacement` on the list sets it for every radio item.

Nothing existing changes. Static, action, link and `selectionMode` lists render and behave exactly as before.

## Files

- `packages/react/src/components/list/List.tsx`: the toggle row, radio list and item props.
- `packages/react/src/components/list/list-styles.ts`: slots for the control and the radio list, and `verticalAlignment`.
- The checkbox, switch and radio recipes: a decorative indicator (the drawn control without an input), shared so the visuals stay identical.
- Tests: `List.test.tsx`, plus type tests for the props that go together (`control` with `checked`, `value` only in a radio list).
- Docs site (`apps/site`): List page sections "Toggle items" and "Radio lists" with live examples, the API table, and search index entries. No new component, so the nav, listing and count stay the same.
- Stories: toggle items (switch, checkbox, both placements), radio list, disabled.
- Changeset (minor).

## Tests and checks

- Roles, names and descriptions with axe; `aria-checked`, radio group semantics, one Tab stop in a radio list.
- Keyboard: Space and Enter toggle; ↑ / ↓ / Home / End in radio lists, with wrapping; disabled items are skipped.
- Pointer: tapping anywhere on the row toggles or selects.
- Controlled and uncontrolled; native form posting.
- Themes × light and dark × contrast levels; forced colours; RTL (placement mirrors); reduced motion (no shape morph, instant indicator); SSR, with no hydration mismatch.
- WCAG 2.2 AA: 48dp targets (rows are 56px or more), focus visible, contrast of the indicator on `surface` and on a container colour.

## In apps, once it's built

A settings page's switches become toggle items, and its language and theme choices become radio lists, replacing hand-styled rows. Tests that find rows by label and role keep working.

## Approved

2026-10-10: build it the best-practice way, with these recommendations:

1. Switch rows use `role="switch"` (the WAI-ARIA Switch pattern), so screen readers say on/off.
2. Radio lists live in `List` (`value` / `onChange`): one list component covers every M3 list item kind.
