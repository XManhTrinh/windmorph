---
'@windmorph/react': minor
---

Initial release of Windmorph: Material 3 Expressive components for React.

Navigation bar and rail labels wrap between words and never break a word bare: a word wider than its item breaks only where the browser hyphenates it for the page's `lang`, and a line it still overflows ends with an ellipsis, while the accessible name keeps the full label.

A `data-tokens` value passed to a component is appended to the component's own token set instead of replacing it, so an app or a library can add its own token set to a core component's root and keep the component's styles. `mergeDataTokens` (from `@windmorph/react/primitives`) merges the two the same way.
