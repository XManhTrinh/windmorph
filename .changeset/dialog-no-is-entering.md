---
'@windmorph/react': patch
---

Fixed: `Dialog` no longer takes `isEntering`, an option React Aria 3.53 added to the type its props extend. The dialog runs its own entrance, so the prop did nothing; apps that install React Aria 3.53 saw it in the editor.
