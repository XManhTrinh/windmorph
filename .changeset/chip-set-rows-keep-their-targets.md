---
'@windmorph/react': patch
---

Changed: a wrapping `ChipSet` puts 16px between its rows instead of 8px (20px and 24px as `density` makes the chips smaller), so rows are 48px apart and every chip takes presses over its full 48px touch target. At 8px the targets of two rows overlapped and the row below took the space between them, which left a chip with another under it 40px. Chips in a row stay 8px apart, and a scrolling set is unchanged. To keep rows closer, pass a `gap-y-*` class in `className`.
