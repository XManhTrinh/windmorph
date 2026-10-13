---
'@windmorph/react': minor
---

Toolbars follow the M3 Expressive spec: floating toolbars are elevated (level 1) by default, with `elevated={false}` to remove it; the docked toolbar centres its items by default (`arrangement="space-between"` spreads them); icon buttons take the toolbar's colours (on-surface-variant, or in a vibrant toolbar on-primary-container, with selected tonal toggles in surface-container); both toolbars can leave the screen on scroll with `visible` and the new `useToolbarScrollExit` hook (`exitEdge` picks the floating toolbar's edge); collapsed controls stay in the tab order and the accessibility tree, and focus on them expands the toolbar; and a development warning flags square icon buttons in a floating toolbar.
