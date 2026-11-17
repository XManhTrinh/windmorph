---
'@windmorph/react': patch
---

Added: motion on values in `@windmorph/react/primitives`: `useM3SpringValue` and `useM3SpringValues` spring a number or a list of numbers on the theme's springs, keeping their speed when a new target arrives (`resample` reads a list at another length, and `keys` match a list by name, so a sliding window's kept elements carry on, with `rest` setting where a new one starts); `AnimatedNumber` counts between values; `staggerDelays` and `useEntrance` play an entrance one item after another, once, when it is first seen.
