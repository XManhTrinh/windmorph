---
'@windmorph/react': patch
---

Fixed: `useEntrance` and `AnimatedNumber` show their final picture when the page is printed. A print runs no frames, so content never scrolled to, or mid-entrance, printed in its start state (flat bars, a line not drawn yet, a count at 0). On `beforeprint`, `useEntrance` enters and reports itself out of view until `afterprint`, committed before the print is laid out, so what React renders from it prints in its final state; Motion writes styles bound to a Motion value on its next frame, which a print doesn't run, so a mark drawn from one needs a CSS print value (its resting geometry as a CSS variable, applied under `@media print`). `AnimatedNumber` prints its final value by CSS alone, so it holds even for a print started from an effect, which is laid out before React renders again.
