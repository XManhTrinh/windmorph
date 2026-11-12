---
'@windmorph/react': patch
---

Fixed: `useScrollRestoration` keeps a page's position through a slow return to it. Going back or forward again, or pressing a link, while the page was still too short to reach its position replaced what was kept with where the page had got to; a key that repeats after the back shortcut ended the hold; and a change of `holdFor` or `storageKey` after the person had scrolled pulled the page back. A reload now restores only the page the document was loaded with, not the first page of a hook that mounts later, and a restored position is held on an element that arrives after the page has changed.
