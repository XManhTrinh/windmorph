---
'@windmorph/react': minor
---

`IconButton` follows the M3 Expressive spec: filled is the default variant (toolbars and app bars keep theirs standard through the new `ButtonContext` `iconButtonVariant`); standard icons are `on-surface-variant` and outlined ones sit in an `outline-variant` outline, recoloured by a container through `--md-comp-icon-button-icon-color`; and the `aria-label` shows as a tooltip on hover and keyboard focus (`tooltip={false}` turns it off). Breaking: icon buttons without a `variant` are now filled; add `variant="standard"` where you relied on the old default, and set `--md-comp-icon-button-icon-color: currentColor` on a container whose text colour they should inherit.
