---
'@windmorph/react': minor
---

`SplitButton` follows the M3 Expressive spec: 48px touch targets at XS and S, inner corners that change on hover and keyboard focus as well as press, the spec's chevron offsets (−1 / −1 / −2 / −3 / −6px), a chevron that turns inwards on the standard scheme's fast spatial spring, and a menu 4px away aligned with the trailing button (`Menu` gains an `offset` prop). The leading button can show only an icon (`leadingLabel` names it), and without `menu` the trailing button opens any overlay through an enclosing trigger or reports `onTrailingPress`. New `classNames.trailingContent`. Breaking: `menuIcon` is removed (the spec says not to replace the icon).
