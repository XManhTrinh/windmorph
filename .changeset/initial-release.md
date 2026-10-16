---
'@windmorph/react': minor
---

Initial release of Windmorph: Material 3 Expressive components for React.

Navigation bar and rail labels wrap between words and never break a word bare: a word wider than its item breaks only where the browser hyphenates it for the page's `lang`, and a line it still overflows ends with an ellipsis, while the accessible name keeps the full label.

A `data-tokens` value passed to a component is appended to the component's own token set instead of replacing it, so an app or a library can add its own token set to a core component's root and keep the component's styles. `mergeDataTokens` (from `@windmorph/react/primitives`) merges the two the same way.

A selectable list's options are named by all their visible text (overline, headline, supporting and trailing text, in order) instead of the headline alone with the supporting text as a description, so the accessible name contains the visible label (WCAG 2.5.3) and screen readers read each part once.

Touch targets (`TouchTarget` and the M icon button's) are 48px in px, so they keep their size when a reader raises the browser's font size instead of growing with the text and overlapping their neighbours.
