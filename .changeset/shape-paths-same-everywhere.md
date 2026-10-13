---
'@windmorph/react': patch
---

Shape paths (`materialShapeMask`, `polygonToPath`, `morphToPath`, `cubicsToPath`) are now the same on the server and in the browser. Node and browsers can differ in the last bits of `Math.sin` and `Math.cos`, which could round a coordinate on a four-decimal boundary differently and make a server-rendered `Avatar` shape fail to hydrate.
