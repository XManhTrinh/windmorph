---
'@windmorph/react': patch
---

Added: the library's consistent names for props that had two: `heroAlign` on `Carousel`, `verticalAlign` on `ListItem`, `itemAlign` on `NavigationRail` (with a `data-item-align` attribute), `current` and `currentIcon` on `NavigationBarItem` and `NavigationRailItem`, `onClose` on `Snackbar` (now the snackbar's own close callback, which shows the close button, where it used to reach the root element as a DOM attribute), and `openDelay` on `TooltipTrigger`, `RichTooltipTrigger` and `SubmenuTrigger`.
