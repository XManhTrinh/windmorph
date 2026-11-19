---
'@windmorph/react': patch
---

Changed: under reduced motion `useEntrance` is always entered, so an entrance no longer waits in its start state (an `AnimatedNumber` at its start, flat bars) until it is scrolled to, only to jump in: it shows its final picture at once. A fade-in that waits for `entered` doesn't play under reduced motion either.
