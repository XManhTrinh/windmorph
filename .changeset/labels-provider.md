---
'@windmorph/react': minor
---

Added: `LabelsProvider`, one place for the words components show or announce by themselves ("Close", "Error", "Character count: 0 of 160"), so an app in another language writes them once instead of passing `labels` to every instance. Its `labels` are keyed by component (the `WindmorphLabels` type, such as `TextField`, `DialogHeader`, `Button`); a component uses its English default, then the provider's word, then its own `labels`, which still wins, and nested providers merge word by word. `useLabels` in `@windmorph/react/primitives` reads the provider from a component of your own. The `CarouselLabels` type is exported too.
