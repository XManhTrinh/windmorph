---
'@windmorph/react': minor
---

Component tokens: M3's `md.comp.*` tokens as CSS variables (`--md-comp-<component>-<part>-<property>`) that restyle every instance of a component, globally, per theme or within any ancestor, without a `className` on each one. Card is the first: `--md-comp-{filled,elevated,outlined}-card-container-color` and `-container-shape`, `--md-comp-elevated-card-container-elevation` and `--md-comp-outlined-card-outline-color`. Defaults are unchanged, and `className` still wins. A card's root now carries `data-variant` (a public styling hook) and `data-tokens`. `cardTokenSet` is exported, and the token engine gains `scopes` and `fixed` values, `componentTokenList`, `isComponentTokenSet` and `elevation()`.

Overlays (menus, dialogs, tooltips, sheets) carry the classes of the `ThemeScope`s they're opened in on their `display: contents` wrapper, so CSS variables set through a scope's class reach them.
