---
'@windmorph/react': minor
---

Text follows the reader's browser font size. The type scale tokens (`--md-sys-typescale-*-size`, `-line-height` and `-tracking`) are now in rem, based on a 16px root, so they render exactly as before at the default size and scale with the browser's font-size setting (WCAG 1.4.4), the way Android's sp follows the system font scale. Layout stays in px. Where 200% text overflowed a fixed height, the container now has a minimum height and grows: the small top app bar's row, tabs, the time picker's AM/PM selector and the large badge. To make one of them shorter than its default, a `className` or `classNames` entry now sets `min-h-*` as well as `h-*`.
