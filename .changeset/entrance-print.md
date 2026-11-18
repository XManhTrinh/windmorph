---
'@windmorph/react': patch
---

Fixed: `useEntrance` shows the final picture when the page is printed. A print runs no frames, so content never scrolled to, or mid-entrance, printed in its start state (flat bars, a line not drawn yet); on `beforeprint` it enters and reports itself out of view, so values land at once rather than animate, until `afterprint`.
