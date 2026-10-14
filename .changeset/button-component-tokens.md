---
'@windmorph/react': minor
---

Button, IconButton and SplitButton read M3 Expressive's component tokens:

- Button: `--md-comp-button-{filled,elevated,tonal,outlined,text}-*` for the container and label colours, the elevated button's `container-elevation`, the outlined button's `outline-color` and the toggle's `selected-*` / `unselected-*` colours, and `--md-comp-button-{xsmall,small,medium,large,xlarge}-container-shape-{round,square}`. The split button's halves follow the colour tokens.
- IconButton: `--md-comp-icon-button-{standard,filled,tonal,outlined}-*` for the container, icon and outline colours and the toggle's selected and unselected colours, and `--md-comp-icon-button-{xsmall…xlarge}-container-shape-{round,square}`. The standard and outlined icon colours fall back to `--md-comp-icon-button-icon-color`, which keeps working as before.
- SplitButton: `--md-comp-split-button-{xsmall…xlarge}-container-shape`, the outer corners.

Defaults are unchanged, and `className` / `classNames` still win. The roots now carry `data-variant` and `data-size` (public styling hooks) and `data-tokens`; the split button's halves carry `data-variant` and `data-slot="leading"` / `"trailing"`. `buttonTokenSet`, `iconButtonTokenSet` and `splitButtonTokenSet` are exported. `buttonVariantClasses` now reads the button's tokens, so an element styled with it needs `data-tokens="md-comp-button"` and `data-variant`, as Button and the split button's halves render them.
